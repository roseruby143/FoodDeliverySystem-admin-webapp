export class SharedVariableData{

    constructor(){
        
    }
    
    private _deliveryStatus = [
        {id : 1, status : 'Driver Assigned'},
        {id : 2, status : 'Orde Picked Up'},
        {id : 3, status : 'Delivered'},
        {id : 4, status : 'Delivery Attempt Failed'}
    ];
    get deliveryStatus() {
        return this._deliveryStatus;
    }
}