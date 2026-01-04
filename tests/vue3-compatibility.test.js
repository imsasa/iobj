import { describe, it, expect, vi } from 'vitest';
import { reactive, isProxy, toRaw, nextTick, watch } from 'vue';
import defineModel from '../src/model.js';
import defineField from '../src/field.js';

describe('Vue 3 Compatibility Tests', () => {
  describe('1. Nested Objects Deep Reactivity', () => {
    it('should trigger updates when modifying deep nested iobj properties in a reactive object', async () => {
      // Define Child Model
      const ChildModel = defineModel({
        name: { defaultValue: 'child' }
      });

      // Define Parent Model with a field holding ChildModel
      // We use a custom field that initializes the ChildModel
      const ParentModel = defineModel({
        child: {
          defaultValue: () => new ChildModel(),
          // We need to ensure the field value is treated as the model instance
        },
        other: 'parent'
      });

      const parent = new ParentModel();
      const reactiveParent = reactive(parent);

      // Verify structure
      expect(reactiveParent.value.child).toBeDefined();
      expect(reactiveParent.value.child.value.name).toBe('child');

      // Setup spy on parent dirty state
      // Note: iobj 'isDirty' is a getter.
      // We can watch the 'isDirty' property if we are in Vue context.
      
      let dirtyChangeCount = 0;
      watch(() => reactiveParent.isDirty, (newVal) => {
        if (newVal) dirtyChangeCount++;
      });

      reactiveParent.value.child.value.name = 'modified child';
      
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for microtasks
      
      expect(reactiveParent.value.child.isDirty).toBe(true);

      // Accessing reactiveParent.value.child.value.name should trigger the reactive system.
      expect(reactiveParent.value.child.value.name).toBe('modified child');
    });

    it('should maintain reactivity when nesting iobj inside Vue reactive', async () => {
      const M = defineModel({ prop: 'a' });
      const m = new M();
      const state = reactive({
        model: m
      });

      let dummy;
      watch(() => state.model.value.prop, (val) => {
        dummy = val;
      });

      state.model.value.prop = 'b';
      await nextTick();
      // Also wait for iobj microtask if any (iobj uses queueMicrotask)
      await new Promise(r => setTimeout(r, 0));

      expect(dummy).toBe('b');
      expect(state.model.isDirty).toBe(true);
    });
  });

  describe('2. Array Operations Reactivity', () => {
    it('should handle push operation reactively', async () => {
      const ItemModel = defineModel({ id: 0 });
      const ListModel = defineModel({
        items: { defaultValue: [] }
      });

      const list = new ListModel();
      const reactiveList = reactive(list);
      
      let length = 0;
      watch(() => reactiveList.value.items.length, (l) => {
        length = l;
      });

      // Push a new item
      const item = new ItemModel({ id: 1 });
      reactiveList.value.items.push(item);
      
      await nextTick();
      
      expect(length).toBe(1);
      expect(reactiveList.value.items[0].value.id).toBe(1);
      
      // iobj array proxy should mark field as dirty
      // Wait for microtask
      await new Promise(r => setTimeout(r, 0));
      expect(reactiveList.isDirty).toBe(true);
      expect(reactiveList.modified.items).toBe(true);
    });

    it('should handle splice operation reactively', async () => {
      const ListModel = defineModel({
        items: { defaultValue: [1, 2, 3] }
      });
      const list = new ListModel();
      const reactiveList = reactive(list);

      let lastRemoved = [];
      watch(() => reactiveList.value.items, (newVal) => {
        // Deep watch usually needed for arrays, but splice changes structure
      }, { deep: true });

      // Use splice to remove element
      const removed = reactiveList.value.items.splice(1, 1); // Remove '2'
      
      await nextTick();
      
      expect(removed[0]).toBe(2);
      expect(reactiveList.value.items).toHaveLength(2);
      expect(reactiveList.value.items).toEqual([1, 3]);

      // Check dirty state
      await new Promise(r => setTimeout(r, 0));
      expect(reactiveList.isDirty).toBe(true);
    });
    
    it('should be reactive when modifying an object inside an array field', async () => {
        // This is tricky. iobj ArrayProxy detects array structure changes (push, splice).
        // But does it detect deep changes in elements? 
        // iobj's array-proxy might not be deep reactive by itself for elements.
        // But Vue's reactive wrapper should make the array elements reactive.
        
        const M = defineModel({
            tags: { defaultValue: [{ name: 'a' }, { name: 'b' }] }
        });
        const m = new M();
        const r = reactive(m);
        
        let changeCount = 0;
        // Watch the array deeply
        watch(() => r.value.tags, () => {
            changeCount++;
        }, { deep: true });
        
        // Modify element property
        r.value.tags[0].name = 'changed';
        await nextTick();
        
        expect(changeCount).toBeGreaterThan(0);
    });
  });

  describe('3. Proxy Conflict and Compatibility', () => {
    it('should pass instanceof checks when wrapped in reactive', () => {
      const M = defineModel({ f: 1 });
      const m = new M();
      const r = reactive(m);

      expect(r instanceof M).toBe(true);
      // Also check unwrap
      expect(toRaw(r) instanceof M).toBe(true);
    });

    it('should not strip prototype methods', () => {
      const M = defineModel({ f: 1 });
      // Add custom method
      M.prototype.customMethod = function() { return this.value.f + 1; };
      
      const m = new M();
      const r = reactive(m);
      
      expect(typeof r.customMethod).toBe('function');
      expect(r.customMethod()).toBe(2);
    });

    it('should allow method calls to access correct "this" context', async () => {
      const M = defineModel({ f: 1 });
      const m = new M();
      const r = reactive(m);

      // Calling validate which uses 'this'
      // defineModel adds validate method to prototype or instance
      // Let's verify validate works
      const isValid = await r.validate();
      expect(isValid).toBeDefined(); // Should be true or undefined based on rules
      
      // Modify value via reactive proxy
      r.value.f = 2;
      await new Promise(r => setTimeout(r, 0));
      expect(r.isDirty).toBe(true);
      
      // Reset
      r.reset();
      expect(r.value.f).toBe(1);
      expect(r.isDirty).toBe(false);
    });
    
    it('should handle Vue Proxy unwrapping correctly in iobj internals', async () => {
        const M = defineModel({ f: 1 });
        const m = new M();
        const r = reactive(m);
        try {
            await r.validate();
        } catch (e) {
            // If it fails, we capture it.
            // But we want to assert it works.
        }
        await expect(r.validate()).resolves.not.toThrow();
    });
  });
});

