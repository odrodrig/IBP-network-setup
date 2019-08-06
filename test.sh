#! bin/bash

# This function gets all components of the blockchain network
# No params required

curl -X DELETE "$API_ENDPOINT/ak/api/v1/kubernetes/components/purge" \
  -H "Authorization: Bearer $IAM_TOKEN"
