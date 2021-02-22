const node_kakao = require("node-kakao");
const client = new node_kakao.TalkClient("디바이스 이름으로 채워주세요. (아무거나 가능합니다.)", "UUID 실행");
const banWord = ["매도", "매수", "리딩", "주식", "주가", "급등주", "상한가", "수익", "투자", "입장하기", "open.kakao.com", "/o/g", "오픈채팅방 배포/가리기봇" /* 홍보를 감지할 메세지를 추가하거나 삭제할 수 있어요. */];

login("kakao talk id", "kakao talk pw");

client.on("message",async (chat) => {

    const id = chat.channel.linkId;
    console.log(id);
    const memberType = await client.userManager.requestUserInfo(chat.channel, chat.sender.id);

    const type = memberType.result.memberStruct.memberType;

    const test = await client.OpenLinkManager.requestKickList(id);

    if(type === 2){
        for (let i = 0; i < banWord.length; i++) {
            if (JSON.stringify(chat.rawAttachment).includes(banWord[i]) || chat.Text.includes(banWord[i])) {
                chat.hide();
                await client.OpenLinkManager.kickMember(chat.channel, chat.sender.id);
                chat.replyText("홍보로 인해서 강퇴를 합니다.");
                break;
            }
        }
    }

});

async function login(email, password) {

    try {
        const loginRes = await client.login(email, password);
        console.log("[Log - login] - 로그인에 성공했습니다.");
    } catch (error) {

        console.log(node_kakao.AuthStatusCode);
        console.log(node_kakao.AuthStatusCode.DEVICE_NOT_REGISTERED);
        if (error.status === node_kakao.AuthStatusCode.DEVICE_NOT_REGISTERED) {
            const requestPasscodeRes = await client.Auth.requestPasscode(email, password, true);
            if (requestPasscodeRes.status === node_kakao.StatusCode.SUCCESS) {
                console.error("[Error - login] - 인증이 필요합니다. 인증번호를 요청했으니 입력해주세요.");
                const readline = require("readline");
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                rl.question("인증코드: ", async (passcode) => {
                    const registerDeviceRes = await client.Auth.registerDevice(passcode, email, password, true);
                    if (registerDeviceRes.status === node_kakao.StatusCode.SUCCESS) {
                        console.log("[Log - login] 인증이 완료되었습니다. 스크립트를 다시 실행해주세요.");
                        process.exit();
                    } else {
                        console.error(`[Error - login] - 인증을 하는 과정에서 오류가 발생했습니다. 오류 JSON: ${JSON.stringify(registerDeviceRes, null, 2)}`);
                        process.exit();
                    }
                });
            } else {
                console.error(`[Error - login] - 인증이 필요하여 인증번호를 요청하는 과정에서 오류가 발생했습니다. 오류 JSON: ${JSON.stringify(requestPasscodeRes, null, 2)}`);
                process.exit();
            }
        } else {
            console.error(`[Error - login] - 로그인을 하는 과정에서 오류가 발생했습니다. 오류 JSON: ${JSON.stringify(error, null, 2)}`);
            process.exit();
        }
    }
}
