@isTest
global class CaseConfigCalloutMock implements HttpCalloutMock{
  global HTTPResponse respond(HTTPRequest request) {
       HttpResponse response = new HttpResponse();
       response.setHeader('Content-Type', 'application/json');
       response.setBody('{"caseId": "50068000005QOhbAAG","status": "Closed","caseConfigs": [{"label": "Test Label","type": "Test Type","amount": 10.00 }]}');
       response.setStatusCode(200);
       return response;
   }
}