import FaqItem from '../../types/FaqItem';

class InfoService {

    getFaq(): FaqItem[] {
        return [{}] as FaqItem[];
    }
}

const infoService = new InfoService();

export default infoService;
