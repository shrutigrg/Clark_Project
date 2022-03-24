# Demo Video
 Refer Case_Demo for short video of work

# Tasks based on User Story
- Create Object - “Config__c” - fields: “Label” (Text, Unique), “Type” (Text), “Amount” (Number)
- Create Object - “Case_Config__c” - fields: “Label” (Text, Unique), “Type” (Text), “Amount”
(Number), Case (Lookup to Case object)
- Create LWC Component - Available Configs to display all Config records with 3-columns: Label, Type and Amount where user can select multiple records.
- Create 2nd LWC component - Case Configs to display all Case Config records with 3-columns: Label, Type and Amount
- Add Pagination in Available Config component to handle large no of records.
- Create Add button Available Configs LWC Component which will add the selected Config records to Case Config LWC Component . Do not allow duplicate records to be added.
- Changes to auto refresh Case Config component every time new records are added.
- Configure Remote Site setting with https://updatecase.requestcatcher.com/
- Create SEND button on Case Config component to make an API call with POST method to external service to add new Case Config records . 
  JSON - {
          "caseId": "50068000005QOhbAAG",
          "status": "Closed",
          "caseConfigs": [{
          "label": "Test Label",
          "type": "Test Type",
          "amount": 10.00 }]
          }
  Mark the Case as closed after successful request
- User should not be able to send the request second time , hence notify the user with appropriate message.
- Create/Update Case flexipage by adding Available Config and Case Config related list on the detail page.
- Write test classes with min 85% test coverage.

# Custom Objects and Fields
- Configs__c -> Label__c , Type__c , Amount_c
- Case_Config__c -> Label__c , Type__c , Amount_c

# LWC Components
- availableConfigs -> To display all the Configs with pagination and Add button to add the selected records to Case Config button
- caseConfigs -> To display the Case Configs records with Send button to send the request to external service

# Apex Classes
- CaseConfigController - To fetch the Available and Case Configs and add Avaialble Configs to Case Configs
- CaseConfigCalloutService -  To send the Case Config records to external system and update the Case status 
- CaseConfigCalloutMock - Mock the external service url
- CaseConfigCalloutTest - Test class for  CaseConfigCalloutService class
- CaseConfigControllerTest - Test class for CaseConfigController class

# Remote Site Settings
- UpdateCase - Register the https://updatecase.requestcatcher.com/ url 

# FlexiPage
-Case_Record_Page - New lwc components added as related list and made as app default

# Notes
- Using Custom table as lightning-datatable is not supported for Mobile Applications
- Used LWC Pub Sub model to connect two components to for auto refresh as the two components are not related i.e parent/child
- Create a wrapper class for send the case config records to external system as there can be more than 1 record
- User will receive notification (Case Configs cannot be added after Case is closed) if Add button is clicked after case is closed 
- User will receive notification (Please select atleast one record to add!) if Add button is clicked without selecting any record
- User will receive notification (Case is successfully closed!) if Send button is clicked after Case is closed hence preventing user to send request multiple times.

# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.



## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
