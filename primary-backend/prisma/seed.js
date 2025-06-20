"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prismaClient.availableTrigger.create({
            data: {
                id: "webhook",
                name: "Webhook",
                image: "https://imgs.search.brave.com/jt-nuqrQTc8sUDegjW5IknnypbZm-onodGbopopEoiQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/aWNvbnNjb3V0LmNv/bS9pY29uL2ZyZWUv/cG5nLTI1Ni9mcmVl/LXdlYmhvb2tzLWlj/b24tZG93bmxvYWQt/aW4tc3ZnLXBuZy1n/aWYtZmlsZS1mb3Jt/YXRzLS1icmFuZC1j/b21wYW55LWxvZ28t/d29ybGQtbG9nb3Mt/dm9sLTMtcGFjay1p/Y29ucy0yODI0MjUu/cG5nP2Y9d2VicCZ3/PTI1Ng"
            }
        });
        yield prismaClient.availableAction.create({
            data: {
                id: "solana",
                name: "Solana",
                image: "https://imgs.search.brave.com/e0SKVPhTwO7vQ2rqYXCn1AZ6QpAWnj_nQI00C3wZG_E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4z/ZC5pY29uc2NvdXQu/Y29tLzNkL3ByZW1p/dW0vdGh1bWIvc29s/YW5hLTNkLWljb24t/ZG93bmxvYWQtaW4t/cG5nLWJsZW5kLWZi/eC1nbHRmLWZpbGUt/Zm9ybWF0cy0tc29s/LXNjYWxhYmlsaXR5/LWRpZ2l0YWwtZG9s/bGFyLWNyeXB0b2N1/cnJlbmN5LWNvaW4t/cGFjay1zY2llbmNl/LXRlY2hub2xvZ3kt/aWNvbnMtMTEzNjI5/MDYucG5nP2Y9d2Vi/cA"
            }
        });
        yield prismaClient.availableAction.create({
            data: {
                id: "email",
                name: "Email",
                image: "https://imgs.search.brave.com/vMXD5zEPHVEvZrWv_KRbb9E1hfOusHVCxhuYK1qyf4g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nbWFydC5jb20v/ZmlsZXMvMTUvRW1h/aWwtU3ltYm9sLVBO/Ry1GaWxlLnBuZw"
            }
        });
    });
}
