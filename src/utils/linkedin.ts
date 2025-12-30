export const openLinkedInSearch = (booleanQuery: string) => {
    if (!booleanQuery) return;
    const cleanQuery = booleanQuery.replace(/[\n\r]/g, ' ').trim();
    const encoded = encodeURIComponent(cleanQuery);
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encoded}`, '_blank');
};
