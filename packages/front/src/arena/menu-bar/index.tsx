import React, { useState, useEffect } from 'react'
import { css } from 'aphrodite/no-important'
import { global_style as gs, style_creater as sc } from 'style/global'
import { style as s } from './style'
import { fromEvent, Subject } from 'rxjs'
import { next_router } from 'routers/pusher'

/** MenuBar */
export default function MenuBar() {
    const menus: menu_vo[] = [
        {
            name: '书架',
            children: [
                {
                    name: '查看',
                    click() {
                        next_router('shelf')
                    },
                },
                {
                    name: '新书',
                    click() {
                        next_router('shelf', 'new')
                    },
                },
            ],
        },
        {
            name: '编辑',
            children: [
                {
                    name: '目录',
                    click() {},
                },
                {
                    name: '文本',
                    click() {},
                },
            ],
        },
    ]
    useEffect(() => {
        const ob1 = fromEvent(document, 'click').subscribe(() => {
            menu_use$.next('')
        })
        return () => {
            ob1.unsubscribe()
        }
    }, [])
    return (
        <div className={css(s.MenuBar)}>
            {menus.map((menu) => (
                <MenuItem key={menu.name} menu={menu} />
            ))}
        </div>
    )
}

/** 打开的菜单, name */
const menu_use$ = new Subject<string>()

interface menu_vo {
    name: string
    children: {
        name: string
        click: () => void
    }[]
}

interface menu_item {
    menu: menu_vo
}
function MenuItem(p: menu_item) {
    const [be_useing, next_be_useing] = useState(false)
    useEffect(() => {
        const ob2 = menu_use$.subscribe((nm) => {
            next_be_useing(nm === p.menu.name)
        })
        return () => {
            ob2.unsubscribe()
        }
    }, [p])

    return (
        <div
            className={css(s.MenuItem, be_useing ? s.MenuItemUse : undefined)}
            onClick={(e) => {
                e.stopPropagation()
                menu_use$.next(p.menu.name)
            }}
        >
            {p.menu.name}
            {be_useing && (
                <div
                    className={css(s.MenuExtend)}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    {p.menu.children.map((cld) => (
                        <div
                            key={p.menu.name + cld.name}
                            className={css(s.MenuExtendItem)}
                            onClick={() => {
                                if (cld.click) {
                                    cld.click()
                                }
                                menu_use$.next('')
                            }}
                        >
                            {cld.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
