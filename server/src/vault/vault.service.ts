import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs';

@Injectable()
export class VaultService {
  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {}

  async getUser() {
    const url = this.configService.get('VAULT_API_URL');
    const token = this.configService.get('VAULT_ROOT_TOKEN');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    console.log('Vault: url', url, 'toke', token);
    const result = await this.httpService.get(`${url}/users/data/researcher1`, config).toPromise();
    console.log('user', result.data);
    console.log('user token', result.data.data.data.token);
  }
}
