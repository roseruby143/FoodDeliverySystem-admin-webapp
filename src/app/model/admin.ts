export interface Admin {
    adminId: number,
    email : string,
    password : string,
    fullName : string,
    status : string,
    imgUrl? : string,
    addedOn? : Date
}
