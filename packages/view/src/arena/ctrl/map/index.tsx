// eslint-disable-next-line
import React, { useState, useEffect } from 'react'
import s from './s.module.scss'
import { next_router } from '@/function/router'
import { book_use$, fs_write } from '@/source'
import ListCtrl from './list-ctrl'
import ListShow from './list-show'
import WorkSpace from './work-space'
import Bar from './bar'
import Foo from './foo'
import { map_list_find$, map_list$ } from './subj'

/** 地图 */
export default function Mapp() {
    useEffect(() => {
        const t = setTimeout(() => {
            if (book_use$.value?.src) {
                map_list_find$.next()
            }
        }, 50)
        return () => {
            clearTimeout(t)
            // 离开时自动保存
            const bks = book_use$.value?.src
            if (bks) {
                fs_write('json', [bks, 'map.json'], map_list$.value)
            }
        }
    }, [])
    if (!book_use$.value?.src) {
        next_router('shelf')
        return null
    }
    return (
        <div className={s.Mapp}>
            <ListCtrl />
            <ListShow />
            <Bar />
            <Foo />
            <WorkSpace />
        </div>
    )
}
