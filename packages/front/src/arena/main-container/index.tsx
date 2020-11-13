// eslint-disable-next-line
import React, { useState, useEffect } from 'react'
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom'
import { router1 } from 'routers/define'
import { mk_router, next_router, router_pusher$ } from 'routers/pusher'
import Option from './option'
import Shelf from './shelf'

/** 主内容区 */
export default function MainContainer() {
    const rt = useHistory()
    useEffect(() => {
        const ob = router_pusher$.subscribe((next) => {
            const cur = rt.location.pathname
            if (next !== cur) {
                rt.push(next)
            }
        })
        return () => {
            ob.unsubscribe()
        }
    }, [rt])
    return (
        <div
            style={{
                overflow: 'hidden',
                flexGrow: 1,
                width: '100vw',
            }}
        >
            <Switch>
                <Route path={mk_router('shelf')} component={Shelf}></Route>
                <Route path={mk_router('option')} component={Option}></Route>
                <Route component={Empty} />
            </Switch>
        </div>
    )
}

function Empty() {
    useEffect(() => {
        setTimeout(() => {
            next_router('shelf')
        }, 17)
    }, [])
    return null
}
