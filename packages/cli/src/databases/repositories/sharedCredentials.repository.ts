import { Service } from 'typedi';
import { DataSource, Repository } from '@n8n/typeorm';
import { SharedCredentials } from '../entities/SharedCredentials';

@Service()
export class SharedCredentialsRepository extends Repository<SharedCredentials> {
	constructor(dataSource: DataSource) {
		super(SharedCredentials, dataSource.manager);
	}
}
