import React, { useState, useEffect } from 'react'
import { Switch } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { router1, router2_option, router2_shelf } from 'router-/define'
import { mk_router, router_pusher$ } from 'router-/pusher'
import LabelBar from 'component-/label-bar'
import EmptyRouter from 'component-/empty-router'
import Ui from './ui'

/** 设置 */
export default function Option() {
    return (
        <>
            <LabelBar
                items={Object.values(router2_option()).map((it) => ({
                    key: it.cn,
                    data: it.en,
                }))}
                hook_select_end={(it) => {
                    const rt = mk_router('option', it.data)
                    router_pusher$.next(rt)
                }}
            />
            <Switch>
                <Route path={mk_router('option', router2_option().edit.en)}></Route>
                <Route path={mk_router('option', router2_option().remind.en)}></Route>
                <Route path={mk_router('option', router2_option().ui.en)} component={Ui}></Route>
                <Route component={EmptyRouter(mk_router('option', router2_option().ui.en))}></Route>
            </Switch>
        </>
    )
}
