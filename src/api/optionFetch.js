function getHeader(token) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'bearer '+token)
    return headers
}

export const optionFetch = () => {

    const optionGet = (token) =>{
        return {
            method: 'GET', 
            headers:getHeader(token)
        }
    }

    const optionPost = (token, body) =>{
        return {
            method: 'POST', 
            headers:getHeader(token),
            body: JSON.stringify(body)
        }
    }

    const optionPut = (token, body) =>{
        return {
            method: 'PUT', 
            headers:getHeader(token),
            body: JSON.stringify(body)
        }
    }

    return {
        optionGet,
        optionPost,
        optionPut
    }

}