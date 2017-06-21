import * as config from 'config';
import { CarinaServer } from './server/socket';

const server = new CarinaServer(config);
