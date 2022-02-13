import getConfig from './config';
import mergeProps from '@form-create/utils/lib/mergeprops';
import is, {hasProperty} from '@form-create/utils/lib/type';
import extend from '@form-create/utils/lib/extend';
import {getCurrentInstance, resolveComponent} from 'vue';

function tidy(props, name) {
    if (!hasProperty(props, name)) return;
    if (is.String(props[name])) {
        props[name] = {[name]: props[name], show: true};
    }
}

function isFalse(val) {
    return val === false;
}

function tidyBool(opt, name) {
    if (hasProperty(opt, name) && !is.Object(opt[name])) {
        opt[name] = {show: !!opt[name]};
    }
}

export default {
    validate() {
        const form = this.form();
        if (form) {
            return form.validate();
        } else {
            return new Promise(v => v());
        }
    },
    validateField(ctx) {
        const fItem = this.vm.refs[ctx.wrapRef];
        if (fItem) {
            return fItem.validate();
        } else {
            return new Promise(v => v());
        }
    },
    clearValidateState(ctx) {
        const fItem = this.vm.refs[ctx.wrapRef];
        fItem && fItem.restoreValidation()
    },
    tidyOptions(options) {
        ['submitBtn', 'resetBtn', 'row', 'info', 'wrap', 'col'].forEach(name => {
            tidyBool(options, name);
        })
        return options;
    },
    tidyRule({prop}) {
        tidy(prop, 'title');
        tidy(prop, 'info');
        return prop;
    },
    mergeProp(ctx) {
        ctx.prop = mergeProps([{
            info: this.options.info || {},
            wrap: this.options.wrap || {},
            col: this.options.col || {},
        }, ctx.prop], {
            info: {
                type: 'popover',
                placement: 'top-start',
                icon: 'icon-info'
            },
            title: {},
            col: {span: 24},
            wrap: {},
        }, {normal: ['title', 'info', 'col', 'wrap']});
    },
    getDefaultOptions() {
        return getConfig();
    },
    update() {
        const form = this.options.form;
        this.rule = {
            props: {...form},
            on: {
                submit: (e) => {
                    e.preventDefault();
                }
            },
            class: [form.className, form.class, 'form-create'],
            style: form.style,
            type: 'form',
        };
    },
    beforeRender() {
        const {key, ref, $handle} = this;
        extend(this.rule, {key, ref});
        extend(this.rule.props, {
            model: $handle.formData,
        });
    },
    render(children) {
        if (children.slotLen()) {
            children.setSlot(undefined, this.makeFormBtn());
        }
        return this.$r(this.rule, isFalse(this.options.row.show) ? children.getSlots() : [this.makeRow(children)]);
    },
    makeWrap(ctx, children) {
        const rule = ctx.prop;
        const uni = `${this.key}${ctx.key}`;
        const col = rule.col;
        const isTitle = this.isTitle(rule);
        const {inline, col: _col} = this.rule.props;
        const item = isFalse(rule.wrap.show) ? children : this.$r(mergeProps([rule.wrap, {
            props: {
                ...(rule.wrap || {}),
                path: ctx.id,
                rule: rule.validate
            },
            class: rule.className,
            key: `${uni}fi`,
            ref: ctx.wrapRef,
            type: 'formItem',
        }]), {default: () => children, ...(isTitle ? {label: () => this.makeInfo(rule, uni)} : {})});
        return (inline === true || isFalse(_col) || isFalse(col.show)) ? item : this.makeCol(rule, uni, [item]);
    },
    isTitle(rule) {
        if (this.options.form.title === false) return false;
        const title = rule.title;
        return !((!title.title && !title.native) || isFalse(title.show));
    },
    makeInfo(rule, uni) {
        const titleProp = rule.title;
        const infoProp = rule.info;
        if (this.options.form.title === false) return false;
        if ((!titleProp.title && !titleProp.native) || isFalse(titleProp.show)) return;
        const children = [titleProp.title];

        if (!isFalse(infoProp.show) && (infoProp.info || infoProp.native) && !isFalse(infoProp.icon)) {
            const prop = {
                type: infoProp.type || 'popover',
                props: {...infoProp},
                key: `${uni}pop`,
            };

            delete prop.props.icon;
            delete prop.props.show;
            delete prop.props.info;

            children[infoProp.align !== 'left' ? 'unshift' : 'push'](this.$r(mergeProps([infoProp, prop]), {
                [infoProp.slot || 'default']: () => infoProp.info,
                [titleProp.slot || 'trigger']: () => this.$r({
                    type: 'NIcon',
                    props: {
                        component: resolveComponent(infoProp.icon === true ? 'icon-info' : infoProp.icon)
                    },
                    style: 'top:2px',
                    key: `${uni}i`
                }, {}, true)
            }))
        }
        return this.$r(mergeProps([titleProp, {
            props: titleProp,
            key: `${uni}tit`,
            type: titleProp.type || 'span',
        }]), children);
    },
    makeCol(rule, uni, children) {
        const col = rule.col;
        return this.$r({
            class: col.class,
            type: 'col',
            props: col || {span: 24},
            key: `${uni}col`
        }, children);
    },
    makeRow(children) {
        const row = this.options.row || {};
        return this.$r({
            type: 'row',
            props: row,
            class: row.class,
            key: `${this.key}row`
        }, children)
    },
    makeFormBtn() {
        let vn = [];
        if (!isFalse(this.options.submitBtn.show)) {
            vn.push(this.makeSubmitBtn())
        }
        if (!isFalse(this.options.resetBtn.show)) {
            vn.push(this.makeResetBtn())
        }
        if (!vn.length) {
            return;
        }
        let {inline} = this.rule.props;
        const item = this.$r({
            type: 'formItem',
            key: `${this.key}fb`,
            props: {
                label: ' ',
            }
        }, vn);

        return inline === true
            ? item
            : this.$r({
                type: 'col',
                props: {span: 24},
                key: `${this.key}fc`
            }, [item]);
    },
    makeResetBtn() {
        const resetBtn = {...this.options.resetBtn};
        const innerText = resetBtn.innerText;
        delete resetBtn.innerText;
        return this.$r({
            type: 'button',
            props: resetBtn,
            style: {width: resetBtn.width, marginLeft: '10px'},
            on: {
                click: () => {
                    const fApi = this.$handle.api;
                    resetBtn.click
                        ? resetBtn.click(fApi)
                        : fApi.resetFields();
                }
            },
            key: `${this.key}b2`,
        }, [innerText]);
    },
    makeSubmitBtn() {
        const submitBtn = {...this.options.submitBtn};
        const innerText = submitBtn.innerText;
        delete submitBtn.innerText;
        return this.$r({
            type: 'button',
            props: submitBtn,
            style: {width: submitBtn.width},
            on: {
                click: () => {
                    const fApi = this.$handle.api;
                    submitBtn.click
                        ? submitBtn.click(fApi)
                        : fApi.submit();
                }
            },
            key: `${this.key}b1`,
        }, [innerText]);
    }
}