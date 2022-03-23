import { LightningElement  , track,wire, api} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAvailableConfig from '@salesforce/apex/CaseConfigController.getAvailableConfig';
import addCaseConfig from '@salesforce/apex/CaseConfigController.addCaseConfig';
import getCaseDetails from '@salesforce/apex/CaseConfigController.getCaseDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import CASE_OBJECT from '@salesforce/schema/Case';
import { publish, MessageContext,subscribe,
    unsubscribe,
    APPLICATION_SCOPE } from 'lightning/messageService';

import CONFIG_SAVED from '@salesforce/messageChannel/Saved_Config__c';

export default class AvailableConfigs extends LightningElement {
   
    subscription;
    @api recordId;
    @track configList = [];
    @track data = [];
    @track error;
    @track selectedConfig = [];
    @track totalRecountCount = 0;
    @track totalPage = 1;
    @track endingRecord = 0;
    @track pageLength = 2;
    @track page = 1;
    @track status;
    @wire(MessageContext)
    messageContext;
    addEvent = false;


    subscribeToMessageChannel() {

        this.subscription = subscribe(
        this.messageContext,
        CONFIG_SAVED,
        (message) => this.getConfig()
        
        );
        
    } 

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    connectedCallback(){
        this.subscribeToMessageChannel();
        this.getConfig(); //load the data
    }


    getConfig(){
        console.log(this.recordId);
        getAvailableConfig()
        .then(data => {
            this.configList=JSON.parse(data);
            this.totalRecountCount = this.configList.length;
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageLength);
            this.data = this.configList.slice(0,this.pageLength); 
            this.endingRecord = this.pageLength;
        
        })
        .catch(error => {
            this.showToast('Error',error, 'error');
        });
    }

  
  
  @wire(getCaseDetails, {caseId: '$recordId'}) getCaseStatus({data,error}){
      if(data){
        this.status = data;
      }
      else if(error){
        if (Array.isArray(error.body)) {
            this.error = error.body.map(e => e.message).join(', ');
            console.log('error---'+JSON.stringify(this.error));
        } else if (typeof error.body.message === 'string') {
            this.error = error.body.message;
            console.log('error---'+this.error);
        }
      }
  };
  
   
    handleSelected(event){       
        this.configList[event.target.value].isSelected= event.target.checked;
    }
    allSelected(event){
        for (var i = 0; i < this.configList.length; i++) {
            this.configList[i].isSelected = event.target.checked;
          }
    }
    addSelected(event){
       this.caseStatus(this.recordId);
       
        if(this.status != 'Closed'){
        for(var i=0 ; i<this.configList.length ; i++){
           if(this.configList[i].isSelected){
               this.selectedConfig.push(this.configList[i]);
               this.configList[i].isSelected = false;
           }
        }
        console.log("###Selected Accounts" + this.selectedConfig.length);
        console.log("###Stringify : " + JSON.stringify(this.selectedConfig));
        
        this.handleSelectedConfigs(this.selectedConfig);
    }
    else{
        this.showToast('Case Closed','Case Configs cannot be added after Case is closed', 'info');
       // return refreshApex(this.getConfig());
    }
      
    }

    handleSelectedConfigs(selectedConfig){
      
        addCaseConfig({selectedConfig : JSON.stringify(selectedConfig),
                      caseId : this.recordId})
        .then(result => {
            this.addEvent = true;
                getRecordNotifyChange([{recordId: this.recordId}])
                publish(this.messageContext,CONFIG_SAVED,null);
                return refreshApex(this.getConfig());
           
        })
        .catch(error => {
            this.showToast('Error',error, 'error');
        });
    }
    nextpage(){
        if((this.page < this.totalPage)){      // && this.page != this.totalPage
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);    
        }  
    }   
    prevpage(){
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }
  
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageLength) ;
        this.endingRecord = (this.pageLength * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.configList.slice(this.startingRecord, this.endingRecord);

        //increment by 1 to display the startingRecord count, 
        //so for 2nd page, it will show "Displaying 6 to 10 of 23 records. Page 2 of 5"
        this.startingRecord = this.startingRecord + 1;
    }    
    async caseStatus(recordId){
        console.log(this.recordId);
        await getCaseDetails({caseId : this.recordId})
        .then(result => {           
                if(result == 'Closed'){
                    this.status = 'Closed';
                }          
        })
        .catch(error => {
            
            this.showToast('Error',error, 'error');
        });
        getRecordNotifyChange([{ recordId: this.recordId }]);
    }

    showToast(title,message,variant){
        const toastEvent = new ShowToastEvent({
            title: title,
            message : message,
            variant:variant
        });
        this.dispatchEvent(toastEvent);
    }

   
}