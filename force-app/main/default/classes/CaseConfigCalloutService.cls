/**
* @Created By : Shruti Garg
* @Created Date : 22 March, 2022
* @Purpose : To send the Case Config records to external system and update the Case status 
*/
public with sharing class CaseConfigCalloutService  {
    
    private static final String CASE_URL = 'https://updatecase.requestcatcher.com/test';
    
    /*
* @Purpose : To pass the id as list to the future method
*/
    @AuraEnabled
    public static void sendCase(Id recordId){
        List<Id> recordIds = new List<Id>();
        try {            
            recordIds.add(recordId);
            updateCase(recordIds);
            //return CaseConfigController.getCaseDetails(recordId); 
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    /*
* @Purpose : Future method to send the records to external system and set the 
case status field to 'Closed'
*/
    @future(callout=true)
    public static void updateCase(List<Id> caseId){
        List<CaseConfigWrapper> lstCaseConfigWc = new List<CaseConfigWrapper>();
        
        try{
            List<Case_Config__c> caseConfig = [Select Id , Label__c , Type__c , Amount__c , Case__c , Case__r.Status from Case_Config__c
                                               where Case__c =:caseId[0]];      
            Case caseObj = [Select Id,status from Case where Id=:caseId[0]];
            
            
            for(Case_Config__c cc : caseConfig){
                CaseConfigWrapper ccw = new CaseConfigWrapper();
                ccw.label=cc.Label__c;
                ccw.type=cc.Type__c;
                ccw.amount=cc.Amount__c;
                lstCaseConfigWc.add(ccw);
            }
            
            CaseWrapper caseWc = new CaseWrapper(lstCaseConfigWc);
            caseWc.status = caseObj.status;
            caseWc.caseId = caseObj.Id;       
            
            String jsonInput = JSON.serialize(caseWc);
            system.debug('jsonInput----'+jsonInput);
            
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(CASE_URL);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json;charset=UTF-8');
            req.setHeader('Sforce-Duplicate-Rule-Header','allowSave=FALSE');        //check for duplicates 
            req.setBody(jsonInput);   
            Http http = new Http();
            HttpResponse response = http.send(req);
            if(response.getStatusCode() == 200){
                caseObj.Status = 'Closed';                
                System.debug('Success: ' + response.getStatus());
            }
            else{            
                System.debug('Failure: ' + response.getStatusCode() + ' ' + response.getStatus());
            }
            update caseObj;  
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    
    public class CaseWrapper{
        public String caseId {get;set;}
        public String status {get;set;}
        public List<CaseConfigWrapper> caseConfigs{get;set;}
        public CaseWrapper(List<CaseConfigWrapper> lstCaseConfigs){
            this.caseId = null;
            this.status = null;   
            caseConfigs = lstCaseConfigs;
        }
    }
    
    public class CaseConfigWrapper{
        public String label{get;set;}	
        public String type{get;set;}	
        public Decimal amount{get;set;}	
        public CaseConfigWrapper(){
            this.label = null;
            this.type = null;
            this.amount = null;
        }
    }
    
    
    
}