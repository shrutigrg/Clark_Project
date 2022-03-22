@isTest
public class CaseConfigControllerTest {
	
    @TestSetup
    static void testsetup(){
        Case objCase = new Case();
        objCase.status = 'New';
        objCase.Origin = 'Email';
        insert objCase;
        
        Config__c objConfig1= new Config__c();
        objConfig1.Label__c = 'Test Label';
        objConfig1.Type__c = 'Test Type';
        objConfig1.Amount__c = 10000;
        insert objConfig1;
        
        Config__c objConfig2= new Config__c();
        objConfig2.Label__c = 'Test Label2';
        objConfig2.Type__c = 'Test Type2';
        objConfig2.Amount__c = 60000;
        insert objConfig2;
        
        Config__c objConfig3= new Config__c();
        objConfig3.Label__c = 'Test Label3';
        objConfig3.Type__c = 'Test Type2';
        objConfig3.Amount__c = 800.50;
        insert objConfig3;
        
        Case_Config__c objCaCon = new Case_Config__c();
        objCaCon.Label__c = 'Test Label';
        objCaCon.Type__c = 'Test Type';
        objCaCon.Amount__c = 10000;
        objCaCon.Case__c = objCase.Id;
        insert objCaCon;
    }
    
    @isTest
    public static void testCaseStatus(){
        Case getCase = [Select Id,status from Case];
        Test.startTest();
        String status = CaseConfigController.getCaseDetails(getCase.Id);
        Test.stopTest();
        
        System.assertEquals('New', status);
    }
    
     @isTest
    public static void testAvailableConfig(){
        List<Config__c> getCase = [Select Id,Label__c,Type__c,Amount__c from Config__c];
        Test.startTest();
        String availConWC = CaseConfigController.getAvailableConfig();
        Test.stopTest();
        
        System.assertEquals(3, getCase.size());
    }
    
     @isTest
    public static void testCaseConfig(){
        List<Case_Config__c> getCaseConfig = [Select Id,Label__c,Type__c,Amount__c,Case__c from Case_Config__c];
        Case getCase = [Select id from Case];
        Test.startTest();
        String caseConWC = CaseConfigController.getCaseConfig();
        Test.stopTest();
        
        System.assertEquals(getCase.Id, getCaseConfig[0].Case__c);
    }
    
      @isTest
    public static void testAddCaseConfig(){
        List<Object> selectedRows = (List<Object>)JSON.deserializeUntyped(
 		'[{"Type":"Fire","Label":"Replacement","isSelected":false,"index":3,"Id":"a005j00000Au80UAAR","Amount":500}]');
      
        
        Case getCase = [Select id from Case];
        Test.startTest();
        CaseConfigController.addCaseConfig(selectedRows, getCase.Id);
        Test.stopTest();
        
        List<Case_Config__c> getCaseConfig = [Select Id,Label__c,Type__c,Amount__c,Case__c from Case_Config__c where Case__c =:getCase.Id];
        System.assertEquals(2, getCaseConfig.size());
    }
}