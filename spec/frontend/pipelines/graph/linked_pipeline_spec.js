import { mount } from '@vue/test-utils';
import { GlButton } from '@gitlab/ui';
import LinkedPipelineComponent from '~/pipelines/components/graph/linked_pipeline.vue';
import CiStatus from '~/vue_shared/components/ci_icon.vue';

import mockData from './linked_pipelines_mock_data';

const mockPipeline = mockData.triggered[0];

const validTriggeredPipelineId = mockPipeline.project.id;
const invalidTriggeredPipelineId = mockPipeline.project.id + 5;

describe('Linked pipeline', () => {
  let wrapper;

  const findButton = () => wrapper.find(GlButton);
  const findPipelineLabel = () => wrapper.find('[data-testid="downstream-pipeline-label"]');
  const findLinkedPipeline = () => wrapper.find({ ref: 'linkedPipeline' });

  const createWrapper = propsData => {
    wrapper = mount(LinkedPipelineComponent, {
      propsData,
    });
  };

  afterEach(() => {
    wrapper.destroy();
  });

  describe('rendered output', () => {
    const props = {
      pipeline: mockPipeline,
      projectId: invalidTriggeredPipelineId,
      columnTitle: 'Downstream',
    };

    beforeEach(() => {
      createWrapper(props);
    });

    it('should render a list item as the containing element', () => {
      expect(wrapper.is('li')).toBe(true);
    });

    it('should render a button', () => {
      expect(findButton().exists()).toBe(true);
    });

    it('should render the project name', () => {
      expect(wrapper.text()).toContain(props.pipeline.project.name);
    });

    it('should render an svg within the status container', () => {
      const pipelineStatusElement = wrapper.find(CiStatus);

      expect(pipelineStatusElement.find('svg').exists()).toBe(true);
    });

    it('should render the pipeline status icon svg', () => {
      expect(wrapper.find('.ci-status-icon-failed svg').exists()).toBe(true);
    });

    it('should have a ci-status child component', () => {
      expect(wrapper.find(CiStatus).exists()).toBe(true);
    });

    it('should render the pipeline id', () => {
      expect(wrapper.text()).toContain(`#${props.pipeline.id}`);
    });

    it('should correctly compute the tooltip text', () => {
      expect(wrapper.vm.tooltipText).toContain(mockPipeline.project.name);
      expect(wrapper.vm.tooltipText).toContain(mockPipeline.details.status.label);
      expect(wrapper.vm.tooltipText).toContain(mockPipeline.source_job.name);
      expect(wrapper.vm.tooltipText).toContain(mockPipeline.id);
    });

    it('should render the tooltip text as the title attribute', () => {
      const titleAttr = findButton().attributes('title');

      expect(titleAttr).toContain(mockPipeline.project.name);
      expect(titleAttr).toContain(mockPipeline.details.status.label);
    });

    it('sets the loading prop to false', () => {
      expect(findButton().props('loading')).toBe(false);
    });

    it('should display multi-project label when pipeline project id is not the same as triggered pipeline project id', () => {
      expect(findPipelineLabel().text()).toBe('Multi-project');
    });
  });

  describe('parent/child', () => {
    const downstreamProps = {
      pipeline: mockPipeline,
      projectId: validTriggeredPipelineId,
      columnTitle: 'Downstream',
    };

    const upstreamProps = {
      ...downstreamProps,
      columnTitle: 'Upstream',
    };

    it('parent/child label container should exist', () => {
      createWrapper(downstreamProps);
      expect(findPipelineLabel().exists()).toBe(true);
    });

    it('should display child label when pipeline project id is the same as triggered pipeline project id', () => {
      createWrapper(downstreamProps);
      expect(findPipelineLabel().exists()).toBe(true);
    });

    it('should display parent label when pipeline project id is the same as triggered_by pipeline project id', () => {
      createWrapper(upstreamProps);
      expect(findPipelineLabel().exists()).toBe(true);
    });
  });

  describe('when isLoading is true', () => {
    const props = {
      pipeline: { ...mockPipeline, isLoading: true },
      projectId: invalidTriggeredPipelineId,
      columnTitle: 'Downstream',
    };

    beforeEach(() => {
      createWrapper(props);
    });

    it('sets the loading prop to true', () => {
      expect(findButton().props('loading')).toBe(true);
    });
  });

  describe('on click/hover', () => {
    const props = {
      pipeline: mockPipeline,
      projectId: validTriggeredPipelineId,
      columnTitle: 'Downstream',
    };

    beforeEach(() => {
      createWrapper(props);
    });

    it('emits `pipelineClicked` event', () => {
      jest.spyOn(wrapper.vm, '$emit');
      findButton().trigger('click');

      expect(wrapper.emitted().pipelineClicked).toBeTruthy();
    });

    it('should emit `bv::hide::tooltip` to close the tooltip', () => {
      jest.spyOn(wrapper.vm.$root, '$emit');
      findButton().trigger('click');

      expect(wrapper.vm.$root.$emit.mock.calls[0]).toEqual([
        'bv::hide::tooltip',
        'js-linked-pipeline-34993051',
      ]);
    });

    it('should emit downstreamHovered with job name on mouseover', () => {
      findLinkedPipeline().trigger('mouseover');
      expect(wrapper.emitted().downstreamHovered).toStrictEqual([['trigger_job']]);
    });

    it('should emit downstreamHovered with empty string on mouseleave', () => {
      findLinkedPipeline().trigger('mouseleave');
      expect(wrapper.emitted().downstreamHovered).toStrictEqual([['']]);
    });
  });
});
