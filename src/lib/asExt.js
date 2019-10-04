import { extname } from 'path';

// 51/70
export default function asExt(pathname) {
	return extname(pathname).slice(1) || null;
}
