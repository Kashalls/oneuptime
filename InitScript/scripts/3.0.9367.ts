import { find, update, findOne } from '../util/db';

const monitorCollection: string = 'monitors';
const componentCollection: string = 'components';

async function run(): void {
    const monitors: $TSFixMe = await find(monitorCollection, {
        deleted: false,
    });

    for (const monitor of monitors) {
        const component: $TSFixMe = await findOne(componentCollection, {
            _id: monitor.componentId,
        });

        if (
            component &&
            String(monitor.projectId) !== String(component.projectId)
        ) {
            await update(
                monitorCollection,
                { _id: monitor._id },
                { projectId: component.projectId }
            );
        }
    }

    return `Script completed`;
}

export default run;