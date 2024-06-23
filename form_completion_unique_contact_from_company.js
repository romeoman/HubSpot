const axios = require('axios');
const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {
  // Extract the email, contactId, and companyId from the input fields
  const email = event.inputFields['email'];
  const contactId = event.inputFields['contactid'];
  const companyId = event.inputFields['companyid'];
  
  // Log the input email, contactId, and companyId for debugging
  console.log('---Starting Process---');
  console.log('Input Email:', email);
  console.log('Contact ID:', contactId);
  console.log('Company ID:', companyId);

  // Check if the email is provided
  if (!email) {
    console.log('Email is required but not provided');
    callback({
      outputFields: {
        submissionStatus: 'Email is required'
      }
    });
    return;
  }

  // Initialize the HubSpot client with the access token
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.ACCESSTOKEN
  });
  console.log('Initialized HubSpot client');

  // Define the URL for retrieving contacts associated with the company
  const companyAssociationsUrl = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/contacts`;

  try {
    // Retrieve the contacts associated with the company
    console.log('Retrieving contacts associated with the company...');
    const companyAssociationsResponse = await axios.get(companyAssociationsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ACCESSTOKEN}`
      }
    });
    console.log('Contacts associated with the company retrieved successfully');

    // Extract contact IDs from the response
    const associatedContacts = companyAssociationsResponse.data.results.map(contact => contact.id);
    console.log('Associated Contacts:', associatedContacts);

    let hasSubmitted = false;

    // Iterate through each contact to check their list memberships
    for (const contact of associatedContacts) {
      console.log(`Checking list memberships for contact ID: ${contact}`);
      // Check if the contact is a member of the list with ILS ID 'LIST_ID'
      const apiResponse = await hubspotClient.crm.lists.membershipsApi.getPage('LIST_ID', undefined, undefined, 100);
      hasSubmitted = apiResponse.results.some(member => member.recordId === contact);

      if (hasSubmitted) {
        console.log(`Contact ID: ${contact} has already submitted the form`);
        break;
      }
    }

    if (hasSubmitted) {
      // If a contact from the same company has already submitted the form, skip the submission
      console.log('A contact from the same company has already submitted the form');
      callback({
        outputFields: {
          submissionStatus: 'A contact from the same company has already submitted the form'
        }
      });
      return;
    }

    // Prepare the payload for the form submission
    const payload = {
      fields: [
        {
          name: 'email',
          value: email
        }
      ]
    };

    // Define the URL for the HubSpot Forms API submission
    const url = `https://api.hsforms.com/submissions/v3/integration/secure/submit/PORTAL_ID/FORM_ID`;

    // Log the payload and URL for debugging
    console.log('Preparing form submission payload and URL');
    console.log('Payload:', JSON.stringify(payload));
    console.log('URL:', url);

    // Make the POST request to the HubSpot Forms API
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Log the response status for debugging
    console.log('Form submission response status:', response.status);

    // Check the response status and log the outcome
    if (response.status === 200) {
      console.log('Form submission successful');
      callback({
        outputFields: {
          submissionStatus: 'Form submission successful'
        }
      });
    } else {
      console.log('Form submission failed with status:', response.status);
      callback({
        outputFields: {
          submissionStatus: 'Form submission failed'
        }
      });
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error occurred:', error);
    callback({
      outputFields: {
        submissionStatus: `Error: ${error.message}`
      }
    });
  }
  console.log('---Process Ended---');
};
