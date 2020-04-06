export const environment = {
    production: true,
    servers: {
        vdi: {
            url: window["env"]["DESKTOP_SERVICE_WEB_TEST_CLIENT_VDI_HOST"] || null,
            path: '/desktop/ws'
        }
    },
};
