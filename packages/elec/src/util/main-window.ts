import { BrowserWindow } from 'electron'
import { create_option } from '@/create'

/** 主窗口 */
let main_window: BrowserWindow | null

export function create_main_window() {
    main_window = new BrowserWindow(create_option())
    return main_window
}

/** 注意使用一定在创建后使用 */
export function get_main_window() {
    // 实际上不应该用此单例模式, 应该保证提前创建
    // if (!main_window) {
    //     create_main_window()
    // }
    return main_window!
}
