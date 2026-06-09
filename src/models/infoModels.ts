import FaqItem from '../types/FaqItem';
import infoService from '../services/infoService/InfoService';

export const getFaq = (): FaqItem[] => {
    return infoService.getFaq();
}
