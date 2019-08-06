// This script will automatically set up a network on the IBM Blockchain Platform.

// The following environment variables need to be set:
//  - API_ENDPOINT - This is the endpoint that we will be targeting for the IBM Blockchain Platform API commands. Can be found in the credentials of the IBP service.
//  - API_KEY - This is the API Key used to authenticate with IBP. Can be found in the credentials of the IBP service
 
// The network will consist of:
// - Org 1
//   - 1 CA
//     - Org1 Admin
//       - Enrollment Id: org1admin
//       - Enrollment Secret: org1adminpw
//   - 1 Peer
//     - Peer1 Admin
//       - Enrollement ID: org1peer1admin
//       - Enrollement Secret: org1peer1adminpw

//  Author: Oliver Rodriguez

const path = require('path');
const request = require("request-promise");
const promise = require("promise");
const fs = require("fs");
const Client = require("fabric-ca-client");

/////////////// Check to see if environment variables are set

// API_KEY
if (!process.env.API_KEY) {
    console.error('API_KEY is not set. Set this by running "export API_KEY=<Your API Key>"');
    process.exit(1);
}

const API_KEY = process.env.API_KEY;

// API_ENDPOINT
if (!process.env.API_ENDPOINT) {
    console.error('API_ENDPOINT is not set. Set this by running "export API_ENDPOINT=<Your API Endpoint>"')
    process.exit(1);
}

const API_ENDPOINT = process.env.API_ENDPOINT;

// // Fabric CA Home
// if (!process.env.FABRIC_CA_CLIENT_HOME) {
//     console.log("FABRIC_CA_CLIENT_HOME not found. Creating new directory in " + path.join(__dirname,"fabric_ca_client_home/"));
//     process.env.FABRIC_CA_CLIENT_HOME = path.join(__dirname,"fabric_ca_client_home/")
// }

/////////////// Declare functions

function makeRequest(options, callback) {
 
    request(options)
        .then((res) => {
            callback(null, res);
        })
        .catch((e) => {
            console.log(e.message);

            if (e.statusCode == 409) {
                callback(e, null);
            } else {
                process.exit(1);
            }
        })
}

// getComponents
function getComponents(IAM_token) {

    let url = API_ENDPOINT+"/ak/api/v1/components";

    var options = {
        url: url,
        headers: {
            Authorization: "Bearer "+IAM_token
        },
        json: true
    }

    return new promise((fulfill, reject) => {
        makeRequest(options, (err, res) => {
            if (err) {
                reject(err);
            } else fulfill(res);
        });
    })
}

function getIAMToken(API_KEY) {

    const url = "https://iam.cloud.ibm.com/identity/token";

    const options = {
        url: url,
        method: "POST",
        form: {
            grant_type: "urn:ibm:params:oauth:grant-type:apikey",
            apikey: API_KEY
        },
        json: true
    }

    return new promise((fulfill, reject) => {
        makeRequest(options, (err, res) => {
            if (err) {
                reject(err);
            } else fulfill(res.access_token);
        });
    })
}

function createCA(IAM_token, orgName) {

    const url = API_ENDPOINT+"/ak/api/v1/kubernetes/components/ca"
    const options = {
        url: url,
        method: "POST",
        headers: {
            Authorization: "Bearer "+IAM_token
        },
        body: {
            display_name: orgName+" CA",
            enroll_id: "admin",
            enroll_secret: "adminpw"
        },
        json: true
    }

    return new promise((fulfill, reject) => {
        makeRequest(options, (err, res) => {

            if (!err) {
                fulfill(res);
            } else reject(err);

        });
    });

}

function enrollUser(enrollmentRequest) {

}

(async function main() {

    try {

        const token = await getIAMToken(API_KEY);

        const components = await getComponents(token);
        
        if (components.length == 0 || !components[0].display_name == "Org1 CA") {
            
            console.log("Org1 CA does not exist. Creating now... ");
            const org1_ca_info = await createCA(token, "Org1");
            console.log(Buffer.from(org1_ca_info.tls_cert, "base64").toString());
            fs.writeFileSync(path.join(__dirname,"certfiles/org1_tls_cert.pem"),Buffer.from(org1_ca_info.tls_cert, "base64").toString());
            console.log("done writing");

            const org1_ca_connect_opts = {
                protocol: "https",
                hostname: org1_ca_info.api_url.split("//")[1].split(":")[0],
                port: org1_ca_info.api_url.split("//")[1].split(":")[1],
                tlsOptions: {
                    trustedRoots: [path.join(__dirname,"certfiles/org1_tls_cert.pem")]
                },
            }

            const org1_CA = new Client.FabricCAClient(org1_ca_connect_opts);

            const org1_enroll_request = {
                enrollmentID: "admin",
                enrollmentSecret: "adminpw",
                attr_reqs: ""
            }

            const enrollmentResponse = await org1_CA.enroll(org1_enroll_request);

            console.log(enrollmentResponse);

            

        } else {
            console.log("Org 1 CA already exists.");
        }

        if (components.length == 0 || !components[0].display_name == "Org1 CA") {
     
            console.log("Org2 CA does not exist. Creating now... ");
            const org2_ca = await createCA(token, "Org2");
            fs.writeFileSync(path.join(__dirname,"certfiles/org2_tls_cert.pem"),Buffer.from(org2_ca.tls_cert, "base64").toString());
            const org2_api_url = org2_ca.api_url;
            const org2_ca_name = org2_ca.ca_name;

        } else {
            console.log("Org 2 CA already exists.");
        }

    } catch(e) {
        console.log(e);
    }


})()

// console.log("Getting IAM Token...");
// getIAMToken(API_KEY)
//     .then((token) => {
//         console.log(token);
//         return token;
//     })
//     .then((token) => {

//         console.log("Creating Certificate Authority for Org 1...");
//         createCA(token, "Org1")
//             .then((res) => {
//                 console.log(res);
//             })

//         console.log("Creating Certificate Authority for Org 2...");
//         createCA(token, "Org2")
//         .then((res) => {
//             console.log(res);
//         })


//     })
//     .catch((err) => {
//         console.error(err);
//     })

// createCA

//////////////////// main

// get IAM token
// create ca 1
// create ca 2
// get connection
