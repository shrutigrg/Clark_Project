/**
* @Created By : Shruti Garg
* @Created Date : 22 March, 2022
* @Purpose : To fetch the Available and Case Configs and add Avaialble Configs to Case Configs
*/
public with sharing class CaseConfigController {
    
    /*
* @Purpose : To get the status of the Case
*/
    @AuraEnabled
    public static  String getCaseDetails(Id caseId){
        Case getStatus = [Select Id,status from Case where Id =:caseId];
        return getStatus.status;
    }
    
    /*
* @Purpose : To fetch available config records 
*/
    @AuraEnabled
    public static String getAvailableConfig(){
        List<configWrap> configWrapList = new List<configWrap>();
        Integer rowIndex = 0;
        try {
            List<Config__c> configList = [Select Id,Name,Label__c,Type__c,Amount__c from Config__c];
            for(Config__c a : configList){
                configWrapList.add(new configWrap(a.Id,a.Label__c,a.Type__c,a.Amount__c,rowIndex));
                rowIndex++;
            }
            return JSON.serialize(configWrapList);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    
    /*
* @Purpose : To fetch case config records 
*/    
    @AuraEnabled
    public static String getCaseConfig(){
        
        List<configWrap> configWrapList = new List<configWrap>();
        Integer rowIndex = 0;
        try {
            List<Case_Config__c> configList = [Select Id,Name,Label__c,Type__c,Amount__c,Case__c from Case_Config__c];
            for(Case_Config__c a : configList){
                configWrapList.add(new configWrap(a.Id,a.Label__c,a.Type__c,a.Amount__c,rowIndex));
                rowIndex++;
            }
            return JSON.serialize(configWrapList);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    
    /*
* @Purpose : To add available config records to case config and check for duplicates while adding
available configs
*/
    
    @AuraEnabled
    public static void addCaseConfig(List<Object> selectedConfig , Id caseId){
        String message = '';
        List<Case_Config__c> caseConfigList = new List<Case_Config__c>();
        Map<String,Case_Config__c> caseConfigMap = new Map<String,Case_Config__c>();
        
        try {
            String JSONString = JSON.serialize(selectedConfig);  //serialize the input into json string
            List<configWrap> wrapper=(List<configWrap>)JSON.deserialize(JSONString,List<configWrap>.class);  // deserialize json string using wrapper class 
            
            for(Case_Config__c cc : [Select Id,Name,Label__c,Type__c,Amount__c,Case__c from Case_Config__c
                                     where Case__c =:caseId ]){
                                         caseConfigMap.put(cc.Label__c , cc);              
                                     }            
            
            for(configWrap cw: wrapper){
                //check if Availabe Config is already present in Case Config 
                if(!caseConfigMap.containsKey(cw.Label) ){
                    Case_Config__c newCaseConfig = new Case_Config__c();
                    newCaseConfig.Label__c = cw.Label;
                    newCaseConfig.Type__c = cw.Type;
                    newCaseConfig.Amount__c = cw.Amount;
                    newCaseConfig.Case__c = caseId;
                    caseConfigList.add(newCaseConfig);
                    
                }
            }
            
            //check if list is empty or not
            if(caseConfigList.size()>0){
                Database.insert(caseConfigList,false);
            }        
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // Config Wrapper 
    public class configWrap{
        public String Id;
        public String Label;
        public String Type;
        public Decimal Amount; 
        public Boolean isSelected;
        public Integer index;
        public configWrap(String Id, String Label, String Type, Decimal Amount,Integer index){
            this.Id = Id;
            this.Label = Label;
            this.Type = Type;
            this.Amount= Amount;
            this.isSelected = false;
            this.index = index;
        }
        
    }
}