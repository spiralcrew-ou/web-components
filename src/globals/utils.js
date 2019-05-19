import moment from 'moment'

export const now = () =>  {
    return moment().format('YYYYMMDDHHMMSS')
}