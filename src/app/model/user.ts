export interface User {
    id : number,
    first_name : string,
    last_name? : string,
    email : string,
    password : string,
    street? : string,
    city? : string
    state? : string
    country? : string
    pincode? : number,
    phone? : string,
    status : string,
    imgUrl? : string,
    created_on? : Date
}
