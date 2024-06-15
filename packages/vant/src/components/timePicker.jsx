import {computed, defineComponent, ref, toRef} from 'vue';
import dayjs from 'dayjs';

const NAME = 'fcTimePicker';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    props: {
        disabled: Boolean,
        placeholder: String,
        modelValue: [String, Number],
        minDate: [String, Date],
        maxDate: [String, Date],
    },
    emits: ['update:modelValue', 'fc.el'],
    setup(props, _) {
        const show = ref(false);
        const modelValue = toRef(props, 'modelValue');

        const formValue = computed(() => {
            if (modelValue.value == null || modelValue.value === '') {
                return [];
            }
            return modelValue.value.split(':');
        });

        const dateRange = computed(() => {
            return {
                minDate: props.minDate ? dayjs(props.minDate).toDate() : undefined,
                maxDate: props.maxDate ? dayjs(props.maxDate).toDate() : undefined,
            }
        })

        const onInput = (val) => {
            _.emit('update:modelValue', val);
        }

        return {
            show,
            formValue,
            dateRange,
            open() {
                if(props.disabled) {
                    return ;
                }
                show.value = true;
            },
            confirm({selectedValues}) {
                onInput(selectedValues.join(':'));
                show.value = false;
            },
        }
    },
    render() {
        return <>
            <van-field ref="el" placeholder={this.placeholder} readonly disabled={this.$props.disabled} onClick={this.open}
                model-value={this.modelValue} isLink/>
            <van-popup show={this.show} onUpdate:show={(v) => this.show = v} round position="bottom">
                <van-time-picker
                    columnsType={['hour', 'minute']}
                    {...{...this.$attrs, ...this.dateRange}}
                    modelValue={this.formValue}
                    onConfirm={this.confirm}
                    onCancel={() => this.show = false}
                />
            </van-popup>
        </>
    },
    mounted() {
        this.$emit('fc.el', this.$refs.el);
    }
});