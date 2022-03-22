@isTest
public class CaseConfigCalloutTest {
     @TestSetup
    static void testsetup(){
        Case objCase = new Case();
        objCase.status = 'New';
        objCase.Origin = 'Email';
        insert objCase;
        
        Case_Config__c objCaCon = new Case_Config__c();
        objCaCon.Label__c = 'Test Label';
        objCaCon.Type__c = 'Test Type';
        objCaCon.Amount__c = 10000;
        objCaCon.Case__c = objCase.Id;
        insert objCaCon;
    }
    
	 @isTest  
    static void testCaseConfigCallout(){
         Case getCase = [Select id from Case];
        Test.startTest();
        // implement mock callout test here
        Test.setMock(HTTPCalloutMock.class, new CaseConfigCalloutMock());
         CaseConfigCalloutService.sendCase(getCase.Id);
        Test.stopTest();
       // System.assertEquals(1, [SELECT count() FROM Product2]);
    }   
}