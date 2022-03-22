# Tasks based on User Story
1. Create Object - “Config__c” - fields: “Label” (Text, Unique), “Type” (Text), “Amount” (Number)
2. Create Object - “Case_Config__c” - fields: “Label” (Text, Unique), “Type” (Text), “Amount”
(Number), Case (Lookup to Case object)
3.Create LWC Component - Available Configs to display all Config records with 3-columns: Label, Type and Amount where user can select multiple records.
4.Create 2nd LWC component - Case Configs to display all Case Config records with 3-columns: Label, Type and Amount
5.Add Pagination in Available Config component to handle large no of records.
6.Create Add button Available Configs LWC Component which will add the selected Config records to Case Config LWC Component . Do not allow duplicate records to be added.
7.Changes to auto refresh Case Config component every time new records are added.
8.Configure Remote Site setting with https://updatecase.requestcatcher.com/
9.Create SEND button on Case Config component to make an API call with POST method to external service to add new Case Config records . 
  JSON - {
          "caseId": "50068000005QOhbAAG",
          "status": "Closed",
          "caseConfigs": [{
          "label": "Test Label",
          "type": "Test Type",
          "amount": 10.00 }]
          }
  Mark the Case as closed after successful request
10.User should not be able to send the request second time , hence disable the button once Send button is clicked
11.Create/Update Case flexipage by adding Available Config and Case Config related list on the detail page
12.Write test classes with min 85% test coverage.


# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
