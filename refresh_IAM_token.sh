#!bin/bash

# This script is for refreshing the IAM token that is stored in the environment variable IAM_TOKEN

# Author: Oliver Rodriguez

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

# Request a new IAM token
JSON_RESPONSE=$(curl -X POST https://iam.cloud.ibm.com/identity/token \
	-H "Content-Type: application/x-www-form-urlencoded" \
  	-H "Accept: application/json" \
  	-d "grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey="$API_KEY)

echo $JSON_RESPONSE

# Parse the JSON to retrieve the access_token property and store in the IAM_TOKEN variable
TEMP=$(echo $JSON_RESPONSE | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w 'access_token')
IAM_TOKEN=${TEMP##*|}

# Display the IAM_TOKEN with instructions on how to export it to the environment
echo ""
echo "Run the following command in your terminal window:"
echo ""
echo -e "\033[1;33mexport IAM_TOKEN=$IAM_TOKEN\033[0m"
echo ""