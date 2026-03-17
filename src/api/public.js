import request from './request'

export const search = (q) => {
    return request({
        url: '/public/search',
        method: 'get',
        params: { q }
    })
}

export const getBookDetail = (id) => {
    return request({
        url: `/public/books/${id}`,
        method: 'get'
    })
}

export const getBookRecommendations = (id) => {
    return request({
        url: `/public/books/${id}/recommendations`,
        method: 'get'
    })
}

export const getCelebrityDetail = (id) => {
    return request({
        url: `/public/celebrities/${id}`,
        method: 'get'
    })
}

export const getCelebrityRecommendations = (id) => {
    return request({
        url: `/public/celebrities/${id}/recommendations`,
        method: 'get'
    })
}

export const getAuthorDetail = (id) => {
    return request({
        url: `/public/authors/${id}`,
        method: 'get'
    })
}

export const getAuthorBooks = (id) => {
    return request({
        url: `/public/authors/${id}/books`,
        method: 'get'
    })
}

export const getAllCelebrities = () => {
    return request({
        url: '/public/celebrities/all',
        method: 'get'
    })
}

export const getClassicBooks = () => {
    return request({
        url: '/public/books/classics',
        method: 'get'
    })
}

// Fixed: Export as publicApi object to support the component imports
export const publicApi = {
    search,
    getBookDetail,
    getBookRecommendations,
    getCelebrityDetail,
    getCelebrityRecommendations,
    getAuthorDetail,
    getAuthorBooks,
    getAllCelebrities,
    getClassicBooks
}
