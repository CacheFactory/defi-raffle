const issue_dapp_tokens = require("./issue-dapp-tokens")
// @ponicode
describe("issue_dapp_tokens", () => {
    test("0", async () => {
        await issue_dapp_tokens("callback detected, not supported yet")
    })

    test("1", async () => {
        await issue_dapp_tokens(undefined)
    })
})
