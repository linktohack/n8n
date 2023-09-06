import WorkflowSettingsVue from '../WorkflowSettings.vue';
import type { EnvironmentVariable, IWorkflowDataUpdate } from '@/Interface';
import { fireEvent } from '@testing-library/vue';
import { setupServer } from '@/__tests__/server';
import { afterAll, beforeAll } from 'vitest';
import { within } from '@testing-library/vue';

import { useSettingsStore } from '@/stores/settings.store';
import { useUsersStore } from '@/stores/users.store';
import { useRootStore } from '@/stores/n8nRoot.store';
import { useWorkflowsEEStore } from '@/stores/workflows.ee.store';
import { useWorkflowsStore } from '@/stores/workflows.store';
import { useWebhooksStore } from '@/stores/webhooks.store';

import { createComponentRenderer } from '@/__tests__/render';
import { createTestingPinia } from '@pinia/testing';
import { STORES, WORKFLOW_SETTINGS_MODAL_KEY } from '@/constants';

import { nextTick } from 'vue';

const setupWorkflowSharingEnabled = (enterpriseSettingsEnabled = false) => {
	return createComponentRenderer(WorkflowSettingsVue, {
		pinia: createTestingPinia({
			initialState: {
				[STORES.UI]: {
					modals: {
						[WORKFLOW_SETTINGS_MODAL_KEY]: {
							open: true,
						},
					},
				},
				[STORES.SETTINGS]: {
					settings: {
						enterprise: {
							sharing: enterpriseSettingsEnabled,
						},
					},
				},
			},
		}),
		global: {
			stubs: ['n8n-tooltip'],
		},
	});
};

const workflowDataUpdate: IWorkflowDataUpdate = {
	id: '1',
	name: 'Test Workflow',
	nodes: [],
	connections: {},
	tags: [],
	active: true,
};

describe('WorkflowSettingsVue', () => {
	let server: ReturnType<typeof setupServer>;

	beforeAll(() => {
		server = setupServer();
	});

	beforeEach(async () => {
		// await useSettingsStore().getSettings();
		// await useUsersStore().loginWithCookie();
		// rootStore = useRootStore();
		// workflowsEEStore = useWorkflowsEEStore();
		// workflowsStore = useWorkflowsStore();
		// webhooksStore = useWebhooksStore();
		// vi.spyOn(workflowsStore, 'workflowName', 'get').mockResolvedValue(workflowDataUpdate.name!);
		// vi.spyOn(workflowsStore, 'workflowId', 'get').mockResolvedValue(workflowDataUpdate.id!);
	});

	afterAll(() => {
		server.shutdown();
	});

	it('should render correctly', async () => {
		const wrapper = setupWorkflowSharingEnabled()({
			props: {
				data: workflowDataUpdate,
			},
		});
		await nextTick();
		expect(wrapper.getByTestId('workflow-settings-dialog')).toBeVisible();
	});

	it('should not render workflow caller policy when sharing is enabled', async () => {
		const wrapper = setupWorkflowSharingEnabled(false)({
			props: {
				data: workflowDataUpdate,
			},
		});

		await nextTick();

		expect(
			within(wrapper.getByTestId('workflow-settings-dialog')).queryByTestId(
				'workflow-caller-policy',
			),
		).not.toBeInTheDocument();
	});

	it('should render workflow caller policy when sharing is enabled', async () => {
		const wrapper = setupWorkflowSharingEnabled(true)({
			props: {
				data: workflowDataUpdate,
			},
		});

		await nextTick();

		expect(wrapper.getByTestId('workflow-caller-policy')).toBeVisible();
	});
});
