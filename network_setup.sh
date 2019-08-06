#!bin/bash
# This script will automatically set up a network on the IBM Blockchain Platform.
#
# The following environment variables need to be set:
#  - API_ENDPOINT - This is the endpoint that we will be targeting for the IBM Blockchain Platform API commands. Can be found in the credentials of the IBP service.
#  - API_KEY - This is the API Key used to authenticate with IBP. Can be found in the credentials of the IBP service
#  
#
#
#
#
# The network will consist of:
# - Org 1
#   - 1 CA
#     - Org1 Admin
#       - Enrollment Id: org1admin
#       - Enrollment Secret: org1adminpw
#   - 1 Peer
#     - Peer1 Admin
#       - Enrollement ID: org1peer1admin
#       - Enrollement Secret: org1peer1adminpw
#
#  Author: Oliver Rodriguez

############### Check to see if required environment variables have been set #####################

# Has the API_ENDPOINT env variable been set?
if [ ! $API_ENDPOINT ] ; then
    echo 'API_ENDPOINT is not set. Set this by running "export API_ENDPOINT=<Your API Endpoint>"'
    exit 1
fi

# Has the API_KEY env variable been set?
if [ ! $API_KEY ] ; then
    echo 'API_KEY is not set. Set this by running "export API_KEY=<Your API Key>"'
    exit 1
fi

if [ ! $FABRIC_CA_CLIENT_HOME ] ; then
    FABRIC_CA_CLIENT_HOME=./fabric_ca_client_home/
fi

##################### Function Declarations ######################################################

# This function will get a specific property of a json object
# @param $1 - The JSON that you want to parse through
# @param $2 - The property that you would like to return the value of
function getJSONproperty {
    temp=$(echo $1 | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w $2)
    echo ${temp##*|}
}

# This function gets all components of the blockchain network
# No params required
function getComponents {
    COMPONENTS=$(curl -X GET https://e732a640f7bf422fb63607ed1ef45d05-optools.bp01.blockchain.cloud.ibm.com/ak/api/v1/components \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $IAM_TOKEN")

    echo $COMPONENTS
}

# This function creates a new Certificate Authority
# @param - the organization name e.g. "Org 1".
# 
function createCA {

    if [ ! $1 ] ; then
        echo "createCA requires one parameter - 'org name' "
        exit 1
    fi

    curl -X POST $(API_ENDPOINT)/ak/api/v1/kubernetes/components/ca \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $IAM_TOKEN" \
    -d "{
        'display_name': $1' CA',
        'enroll_id': 'admin',
        'enroll_secret': 'adminpw'
        }"
}


############################### Main #############################################################

JSON=$(curl -X POST https://iam.cloud.ibm.com/identity/token \
	-H "Content-Type: application/x-www-form-urlencoded" \
  	-H "Accept: application/json" \
  	-d "grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey="$API_KEY)

# PROPERTY='access_token'
IAM_TOKEN=$(getJSONproperty "$JSON" 'access_token')

# Create Certificate Authority for Org1
createCA "Org 1"

# Create Certificate Authority for Org2
createCA "Org 2"

# Get connection information from network components
JSON=$(getComponents)



# url and cert. Store cert in file locally

# Enroll admin for Org1 CA

# Enroll admin for Org2 CA

# Register org1 admin

# Register org1 peer admin

# Register org 2 admin

# Register org 2 peer admin






