import { Account } from "./account";

export interface AccountClient {
  getAccount(id: string): Promise<Account>;
  createAccount(name: string): Promise<Account>;
}

class AccountClientImpl implements AccountClient {

  constructor(private readonly baseUrl: string) {}

  getAccount(id: string): Promise<Account> {
    return this.sendRequest(`/account/${id}`, { next: { tags: ['account'] } });
  }

  createAccount(name: string): Promise<Account> {
    return this.sendRequest(`/account/register`, { 
      method: 'POST', 
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  private async sendRequest(path: string, init?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (response.status > 400) {
      throw Error(`Request for ${path} returned error: ${await response.text()}`);
    } else {
      return await response.json();
    }
  }
}

export const accountClient = new AccountClientImpl('http://localhost:8080');