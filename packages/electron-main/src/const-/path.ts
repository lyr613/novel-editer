import path from 'path'
import { app } from 'electron'

/** 路径 */
export const paths = () => ({
    did_build_html: path.join(app.getAppPath(), 'build-page', 'index.html'),
    dev_html: 'http://localhost:7098/#/',
    /** 编辑器配置文件 */
    option: path.join(app.getPath('documents'), 'qv-writer', 'option.json'),
})
