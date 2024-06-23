
# HubSpot Form Submission Script

## Description

This script is designed to ensure that only one contact from a specific company can submit a form using the HubSpot Forms API. It performs several key actions:

1. **Initialization and Input Validation**:
   - Extracts the email, contact ID, and company ID from the input fields provided by the workflow.
   - Initializes the HubSpot client using an access token stored in environment variables.
   - Checks if the email is provided; if not, returns an error message.

2. **Retrieve Associated Contacts**:
   - Retrieves the list of contacts associated with the specified company using the company ID.
   - Logs the associated contacts for debugging purposes.

3. **Check List Memberships**:
   - Iterates through each associated contact to check if they are members of a specific list (identified by ILS ID `LIST_ID`) which represents form submissions.
   - If a contact from the same company has already submitted the form, skips the submission and returns a message indicating that a submission has already been made.

4. **Form Submission**:
   - If no previous submission is found, prepares the payload and makes a POST request to submit the form using the HubSpot Forms API.
   - Logs the response status and returns an appropriate message based on whether the form submission was successful or not.

5. **Error Handling**:
   - Includes error handling to log and return any errors that occur during the process.

## Setup Instructions

### Environment Variables

Ensure you have the following environment variables set up:

- `ACCESSTOKEN`: The access token for HubSpot API access. This token is necessary for authenticating API requests to HubSpot.

### Input Properties for Workflow

The workflow triggering this script must provide the following input fields:

- `email`: The email address of the contact attempting to submit the form.
- `contactid`: The unique record ID of the contact in HubSpot.
- `companyid`: The unique record ID of the company associated with the contact in HubSpot.

### Placeholders in the Script

Replace the following placeholders in the script with your actual data:

- **PORTAL_ID**: Replace with your HubSpot portal ID.
- **FORM_ID**: Replace with your HubSpot form ID.
- **LIST_ID**: Replace with your list ID for checking memberships (e.g., `5372`).

### Testing Instructions

To test the script, follow these steps:

1. **Set Up Environment**:
   - Ensure you have the necessary environment variables set up, especially `ACCESSTOKEN` for HubSpot API access.

2. **Create a Workflow**:
   - Set up a HubSpot workflow that triggers this script.
   - Ensure the workflow provides the necessary input fields: `email`, `contactid`, and `companyid`.

3. **Run the Workflow**:
   - Execute the workflow with test data.
   - Check the logs to ensure that each step is executed correctly and observe the final outcome.

4. **Verify Results**:
   - Confirm that the form submission only proceeds if no previous submission exists from the same company.
   - Review the returned messages to verify the correct handling of cases where a submission has already been made.

By following these instructions and using the provided code template, you can ensure that the script works as expected and only allows one submission per company.
