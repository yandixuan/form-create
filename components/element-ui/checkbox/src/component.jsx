const NAME = 'fc-checkbox';

export default {
    name: NAME,
    props: {
        formCreateRule: {
            type: Object,
            default: () => ({})
        },
        formCreateOptions: {
            type: Array,
            default: () => []
        },
        value: {
            type: Array,
            default: () => []
        },
        type: String
    },
    watch: {
        value() {
            this.update();
        }
    },
    data() {
        return {
            trueValue: []
        }
    },
    methods: {
        onInput(n) {
            this.$emit('input', this.formCreateOptions.filter((opt) => n.indexOf(opt.label) !== -1).map((opt) => opt.value));
        },
        update() {
            this.trueValue = this.value ? this.formCreateOptions.filter((opt) => this.value.indexOf(opt.value) !== -1)
                .map((option) => option.label) : []
        }
    },
    created() {
        this.update();
    },
    render() {
        return <ElCheckboxGroup {...this.formCreateRule} v-model={this.trueValue}
            on-input={this.onInput}>{this.formCreateOptions.map((opt, index) => {
                const props = {...opt};
                const Type = this.type === 'button' ? 'ElCheckboxButton' : 'ElCheckbox';
                delete props.value;
                return <Type {...{props}} key={Type + index + props.value}/>
            })}{this.$slots.default}</ElCheckboxGroup>
    }
}
