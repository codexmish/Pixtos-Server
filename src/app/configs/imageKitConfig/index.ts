import {ImageKit, toFile} from '@imagekit/nodejs';
import envConfig from '../envConfig';

export const imagekitClient = new ImageKit({
  privateKey: envConfig.IMAGEKIT_PRIVATE_KEY,

});


export {toFile}
