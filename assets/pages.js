/**
 * @class Pages
 */
class Pages {
    /**
     * @constructor
     */
    constructor(pages, listLen) {
        this.pages       = pages;
        this.currentPage = 1;
        this.listLen     = listLen;
    }
    /**
     *
     * @param page
     */
    getPageViewable(page) {
        let ret = [page];
        page || (page = this.currentPage);
        let pages   = this.pages;
        let listLen = this.listLen-1;
        for (let i = 1; ret.length < listLen&&ret.length<pages; i++) {
            let pre = page - i;
            pre > 0 && ret.unshift(pre);
            let nxt = page + i;
            nxt <= pages && ret.push(nxt);
            if (pre <= 0 && nxt >= pages) break;
        }
        if (ret[0] !== 1) {
            ret[1] = '…';
            ret[0] = 1;
        }
        let retLen = ret.length;
        if (ret[retLen - 1] !== pages) {
            ret[retLen - 2] = '…';
            ret[retLen - 1] = pages;
        }
        return ret;
    }
}

/**
 * test
 */
let pageObj=new Pages(100,10);
console.log(pageObj.getPageViewable(3));
