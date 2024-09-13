let token: string | null = null
let expired: number = new Date().getTime() / 1000
const auth = async () => {
    const url = new URL(`https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken`);
        url.searchParams.append('grant_type', 'client_credentials');
    const bodyData = new URLSearchParams({
        client_id: Bun.env.CLIENT_ID,
        client_secret: Bun.env.CLIENT_SECRET
    });
    const res = await fetch(url.toString(),{
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyData
    })

    const result = await res.json()
    // const res = await axios.post(satusehat.urlAuth + '/accesstoken', { client_id: satusehat.clientId, client_secret: satusehat.clientSecret }, {
    //     params: {
    //         grant_type: "client_credentials"
    //     },
    //     headers: {
    //         "Content-Type": "application/x-www-form-urlencoded"
    //     }
    // })
    expired += Number(result.expired_in);
    token = result.access_token
    return token;
}

export const fetchToken = async () => {
    if (!token || expired < new Date().getTime() / 1000) {
        await auth(); // Mengambil token baru jika belum ada atau sudah kedaluwarsa
    }

    return token;
}