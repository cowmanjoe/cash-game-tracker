import { Account } from "./account";
import { ServerResponse } from "./response";

const baseUrl = 'http://localhost:8080';

export function getAccount(id: string): Promise<ServerResponse<Account>> {
  return sendRequest(`/account/${id}`, { next: { tags: ['account'] } });
}

export function createAccount(name: string): Promise<ServerResponse<Account>> {
  return sendRequest(`/account/register`, { 
    method: 'POST', 
    body: JSON.stringify({ name }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

async function sendRequest<R>(path: string, init?: RequestInit): Promise<ServerResponse<R>> {
  const response = await fetch(`${baseUrl}${path}`, init);

  return await response.json();
}