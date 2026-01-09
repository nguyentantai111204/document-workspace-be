export const getNowDate = () => new Date();

export const calcRefreshTokenExpireTime = () => {
    const expiresDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES || '7', 10);

    const now = getNowDate();
    return new Date(now.getTime() + expiresDays * 24 * 60 * 60 * 1000);
}