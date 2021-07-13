function validationCheck(email, phone_no) {
    const email_regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(phone_no.toString().length != 10 || isNaN(phone_no)) {
        return false
    }
    if(!email_regex.test(email)) {
        return false
    }
    return true
}

module.exports = validationCheck;