import { __assign, __read, __spread, __values } from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer as AnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
import { ElementInstructionMap } from '../dsl/element_instruction_map';
import { ENTER_CLASSNAME, LEAVE_CLASSNAME, NG_ANIMATING_CLASSNAME, NG_ANIMATING_SELECTOR, NG_TRIGGER_CLASSNAME, NG_TRIGGER_SELECTOR, copyObj, eraseStyles, setStyles } from '../util';
import { getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer } from './shared';
var QUEUED_CLASSNAME = 'ng-animate-queued';
var QUEUED_SELECTOR = '.ng-animate-queued';
var DISABLED_CLASSNAME = 'ng-animate-disabled';
var DISABLED_SELECTOR = '.ng-animate-disabled';
var STAR_CLASSNAME = 'ng-star-inserted';
var STAR_SELECTOR = '.ng-star-inserted';
var EMPTY_PLAYER_ARRAY = [];
var NULL_REMOVAL_STATE = {
    namespaceId: '',
    setForRemoval: false,
    setForMove: false,
    hasAnimation: false,
    removedBeforeQueried: false
};
var NULL_REMOVED_QUERIED_STATE = {
    namespaceId: '',
    setForMove: false,
    setForRemoval: false,
    hasAnimation: false,
    removedBeforeQueried: true
};
export var REMOVAL_FLAG = '__ng_removed';
var StateValue = /** @class */ (function () {
    function StateValue(input, namespaceId) {
        if (namespaceId === void 0) { namespaceId = ''; }
        this.namespaceId = namespaceId;
        var isObj = input && input.hasOwnProperty('value');
        var value = isObj ? input['value'] : input;
        this.value = normalizeTriggerValue(value);
        if (isObj) {
            var options = copyObj(input);
            delete options['value'];
            this.options = options;
        }
        else {
            this.options = {};
        }
        if (!this.options.params) {
            this.options.params = {};
        }
    }
    Object.defineProperty(StateValue.prototype, "params", {
        get: function () { return this.options.params; },
        enumerable: true,
        configurable: true
    });
    StateValue.prototype.absorbOptions = function (options) {
        var newParams = options.params;
        if (newParams) {
            var oldParams_1 = this.options.params;
            Object.keys(newParams).forEach(function (prop) {
                if (oldParams_1[prop] == null) {
                    oldParams_1[prop] = newParams[prop];
                }
            });
        }
    };
    return StateValue;
}());
export { StateValue };
export var VOID_VALUE = 'void';
export var DEFAULT_STATE_VALUE = new StateValue(VOID_VALUE);
var AnimationTransitionNamespace = /** @class */ (function () {
    function AnimationTransitionNamespace(id, hostElement, _engine) {
        this.id = id;
        this.hostElement = hostElement;
        this._engine = _engine;
        this.players = [];
        this._triggers = {};
        this._queue = [];
        this._elementListeners = new Map();
        this._hostClassName = 'ng-tns-' + id;
        addClass(hostElement, this._hostClassName);
    }
    AnimationTransitionNamespace.prototype.listen = function (element, name, phase, callback) {
        var _this = this;
        if (!this._triggers.hasOwnProperty(name)) {
            throw new Error("Unable to listen on the animation trigger event \"" + phase + "\" because the animation trigger \"" + name + "\" doesn't exist!");
        }
        if (phase == null || phase.length == 0) {
            throw new Error("Unable to listen on the animation trigger \"" + name + "\" because the provided event is undefined!");
        }
        if (!isTriggerEventValid(phase)) {
            throw new Error("The provided animation trigger event \"" + phase + "\" for the animation trigger \"" + name + "\" is not supported!");
        }
        var listeners = getOrSetAsInMap(this._elementListeners, element, []);
        var data = { name: name, phase: phase, callback: callback };
        listeners.push(data);
        var triggersWithStates = getOrSetAsInMap(this._engine.statesByElement, element, {});
        if (!triggersWithStates.hasOwnProperty(name)) {
            addClass(element, NG_TRIGGER_CLASSNAME);
            addClass(element, NG_TRIGGER_CLASSNAME + '-' + name);
            triggersWithStates[name] = DEFAULT_STATE_VALUE;
        }
        return function () {
            // the event listener is removed AFTER the flush has occurred such
            // that leave animations callbacks can fire (otherwise if the node
            // is removed in between then the listeners would be deregistered)
            _this._engine.afterFlush(function () {
                var index = listeners.indexOf(data);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
                if (!_this._triggers[name]) {
                    delete triggersWithStates[name];
                }
            });
        };
    };
    AnimationTransitionNamespace.prototype.register = function (name, ast) {
        if (this._triggers[name]) {
            // throw
            return false;
        }
        else {
            this._triggers[name] = ast;
            return true;
        }
    };
    AnimationTransitionNamespace.prototype._getTrigger = function (name) {
        var trigger = this._triggers[name];
        if (!trigger) {
            throw new Error("The provided animation trigger \"" + name + "\" has not been registered!");
        }
        return trigger;
    };
    AnimationTransitionNamespace.prototype.trigger = function (element, triggerName, value, defaultToFallback) {
        var _this = this;
        if (defaultToFallback === void 0) { defaultToFallback = true; }
        var trigger = this._getTrigger(triggerName);
        var player = new TransitionAnimationPlayer(this.id, triggerName, element);
        var triggersWithStates = this._engine.statesByElement.get(element);
        if (!triggersWithStates) {
            addClass(element, NG_TRIGGER_CLASSNAME);
            addClass(element, NG_TRIGGER_CLASSNAME + '-' + triggerName);
            this._engine.statesByElement.set(element, triggersWithStates = {});
        }
        var fromState = triggersWithStates[triggerName];
        var toState = new StateValue(value, this.id);
        var isObj = value && value.hasOwnProperty('value');
        if (!isObj && fromState) {
            toState.absorbOptions(fromState.options);
        }
        triggersWithStates[triggerName] = toState;
        if (!fromState) {
            fromState = DEFAULT_STATE_VALUE;
        }
        var isRemoval = toState.value === VOID_VALUE;
        // normally this isn't reached by here, however, if an object expression
        // is passed in then it may be a new object each time. Comparing the value
        // is important since that will stay the same despite there being a new object.
        // The removal arc here is special cased because the same element is triggered
        // twice in the event that it contains animations on the outer/inner portions
        // of the host container
        if (!isRemoval && fromState.value === toState.value) {
            // this means that despite the value not changing, some inner params
            // have changed which means that the animation final styles need to be applied
            if (!objEquals(fromState.params, toState.params)) {
                var errors = [];
                var fromStyles_1 = trigger.matchStyles(fromState.value, fromState.params, errors);
                var toStyles_1 = trigger.matchStyles(toState.value, toState.params, errors);
                if (errors.length) {
                    this._engine.reportError(errors);
                }
                else {
                    this._engine.afterFlush(function () {
                        eraseStyles(element, fromStyles_1);
                        setStyles(element, toStyles_1);
                    });
                }
            }
            return;
        }
        var playersOnElement = getOrSetAsInMap(this._engine.playersByElement, element, []);
        playersOnElement.forEach(function (player) {
            // only remove the player if it is queued on the EXACT same trigger/namespace
            // we only also deal with queued players here because if the animation has
            // started then we want to keep the player alive until the flush happens
            // (which is where the previousPlayers are passed into the new palyer)
            if (player.namespaceId == _this.id && player.triggerName == triggerName && player.queued) {
                player.destroy();
            }
        });
        var transition = trigger.matchTransition(fromState.value, toState.value, element, toState.params);
        var isFallbackTransition = false;
        if (!transition) {
            if (!defaultToFallback)
                return;
            transition = trigger.fallbackTransition;
            isFallbackTransition = true;
        }
        this._engine.totalQueuedPlayers++;
        this._queue.push({ element: element, triggerName: triggerName, transition: transition, fromState: fromState, toState: toState, player: player, isFallbackTransition: isFallbackTransition });
        if (!isFallbackTransition) {
            addClass(element, QUEUED_CLASSNAME);
            player.onStart(function () { removeClass(element, QUEUED_CLASSNAME); });
        }
        player.onDone(function () {
            var index = _this.players.indexOf(player);
            if (index >= 0) {
                _this.players.splice(index, 1);
            }
            var players = _this._engine.playersByElement.get(element);
            if (players) {
                var index_1 = players.indexOf(player);
                if (index_1 >= 0) {
                    players.splice(index_1, 1);
                }
            }
        });
        this.players.push(player);
        playersOnElement.push(player);
        return player;
    };
    AnimationTransitionNamespace.prototype.deregister = function (name) {
        var _this = this;
        delete this._triggers[name];
        this._engine.statesByElement.forEach(function (stateMap, element) { delete stateMap[name]; });
        this._elementListeners.forEach(function (listeners, element) {
            _this._elementListeners.set(element, listeners.filter(function (entry) { return entry.name != name; }));
        });
    };
    AnimationTransitionNamespace.prototype.clearElementCache = function (element) {
        this._engine.statesByElement.delete(element);
        this._elementListeners.delete(element);
        var elementPlayers = this._engine.playersByElement.get(element);
        if (elementPlayers) {
            elementPlayers.forEach(function (player) { return player.destroy(); });
            this._engine.playersByElement.delete(element);
        }
    };
    AnimationTransitionNamespace.prototype._signalRemovalForInnerTriggers = function (rootElement, context) {
        var _this = this;
        var elements = this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true);
        // emulate a leave animation for all inner nodes within this node.
        // If there are no animations found for any of the nodes then clear the cache
        // for the element.
        elements.forEach(function (elm) {
            // this means that an inner remove() operation has already kicked off
            // the animation on this element...
            if (elm[REMOVAL_FLAG])
                return;
            var namespaces = _this._engine.fetchNamespacesByElement(elm);
            if (namespaces.size) {
                namespaces.forEach(function (ns) { return ns.triggerLeaveAnimation(elm, context, false, true); });
            }
            else {
                _this.clearElementCache(elm);
            }
        });
        // If the child elements were removed along with the parent, their animations might not
        // have completed. Clear all the elements from the cache so we don't end up with a memory leak.
        this._engine.afterFlushAnimationsDone(function () { return elements.forEach(function (elm) { return _this.clearElementCache(elm); }); });
    };
    AnimationTransitionNamespace.prototype.triggerLeaveAnimation = function (element, context, destroyAfterComplete, defaultToFallback) {
        var _this = this;
        var triggerStates = this._engine.statesByElement.get(element);
        if (triggerStates) {
            var players_1 = [];
            Object.keys(triggerStates).forEach(function (triggerName) {
                // this check is here in the event that an element is removed
                // twice (both on the host level and the component level)
                if (_this._triggers[triggerName]) {
                    var player = _this.trigger(element, triggerName, VOID_VALUE, defaultToFallback);
                    if (player) {
                        players_1.push(player);
                    }
                }
            });
            if (players_1.length) {
                this._engine.markElementAsRemoved(this.id, element, true, context);
                if (destroyAfterComplete) {
                    optimizeGroupPlayer(players_1).onDone(function () { return _this._engine.processLeaveNode(element); });
                }
                return true;
            }
        }
        return false;
    };
    AnimationTransitionNamespace.prototype.prepareLeaveAnimationListeners = function (element) {
        var _this = this;
        var listeners = this._elementListeners.get(element);
        if (listeners) {
            var visitedTriggers_1 = new Set();
            listeners.forEach(function (listener) {
                var triggerName = listener.name;
                if (visitedTriggers_1.has(triggerName))
                    return;
                visitedTriggers_1.add(triggerName);
                var trigger = _this._triggers[triggerName];
                var transition = trigger.fallbackTransition;
                var elementStates = _this._engine.statesByElement.get(element);
                var fromState = elementStates[triggerName] || DEFAULT_STATE_VALUE;
                var toState = new StateValue(VOID_VALUE);
                var player = new TransitionAnimationPlayer(_this.id, triggerName, element);
                _this._engine.totalQueuedPlayers++;
                _this._queue.push({
                    element: element,
                    triggerName: triggerName,
                    transition: transition,
                    fromState: fromState,
                    toState: toState,
                    player: player,
                    isFallbackTransition: true
                });
            });
        }
    };
    AnimationTransitionNamespace.prototype.removeNode = function (element, context) {
        var _this = this;
        var engine = this._engine;
        if (element.childElementCount) {
            this._signalRemovalForInnerTriggers(element, context);
        }
        // this means that a * => VOID animation was detected and kicked off
        if (this.triggerLeaveAnimation(element, context, true))
            return;
        // find the player that is animating and make sure that the
        // removal is delayed until that player has completed
        var containsPotentialParentTransition = false;
        if (engine.totalAnimations) {
            var currentPlayers = engine.players.length ? engine.playersByQueriedElement.get(element) : [];
            // when this `if statement` does not continue forward it means that
            // a previous animation query has selected the current element and
            // is animating it. In this situation want to continue forwards and
            // allow the element to be queued up for animation later.
            if (currentPlayers && currentPlayers.length) {
                containsPotentialParentTransition = true;
            }
            else {
                var parent_1 = element;
                while (parent_1 = parent_1.parentNode) {
                    var triggers = engine.statesByElement.get(parent_1);
                    if (triggers) {
                        containsPotentialParentTransition = true;
                        break;
                    }
                }
            }
        }
        // at this stage we know that the element will either get removed
        // during flush or will be picked up by a parent query. Either way
        // we need to fire the listeners for this element when it DOES get
        // removed (once the query parent animation is done or after flush)
        this.prepareLeaveAnimationListeners(element);
        // whether or not a parent has an animation we need to delay the deferral of the leave
        // operation until we have more information (which we do after flush() has been called)
        if (containsPotentialParentTransition) {
            engine.markElementAsRemoved(this.id, element, false, context);
        }
        else {
            var removalFlag = element[REMOVAL_FLAG];
            if (!removalFlag || removalFlag === NULL_REMOVAL_STATE) {
                // we do this after the flush has occurred such
                // that the callbacks can be fired
                engine.afterFlush(function () { return _this.clearElementCache(element); });
                engine.destroyInnerAnimations(element);
                engine._onRemovalComplete(element, context);
            }
        }
    };
    AnimationTransitionNamespace.prototype.insertNode = function (element, parent) { addClass(element, this._hostClassName); };
    AnimationTransitionNamespace.prototype.drainQueuedTransitions = function (microtaskId) {
        var _this = this;
        var instructions = [];
        this._queue.forEach(function (entry) {
            var player = entry.player;
            if (player.destroyed)
                return;
            var element = entry.element;
            var listeners = _this._elementListeners.get(element);
            if (listeners) {
                listeners.forEach(function (listener) {
                    if (listener.name == entry.triggerName) {
                        var baseEvent = makeAnimationEvent(element, entry.triggerName, entry.fromState.value, entry.toState.value);
                        baseEvent['_data'] = microtaskId;
                        listenOnPlayer(entry.player, listener.phase, baseEvent, listener.callback);
                    }
                });
            }
            if (player.markedForDestroy) {
                _this._engine.afterFlush(function () {
                    // now we can destroy the element properly since the event listeners have
                    // been bound to the player
                    player.destroy();
                });
            }
            else {
                instructions.push(entry);
            }
        });
        this._queue = [];
        return instructions.sort(function (a, b) {
            // if depCount == 0 them move to front
            // otherwise if a contains b then move back
            var d0 = a.transition.ast.depCount;
            var d1 = b.transition.ast.depCount;
            if (d0 == 0 || d1 == 0) {
                return d0 - d1;
            }
            return _this._engine.driver.containsElement(a.element, b.element) ? 1 : -1;
        });
    };
    AnimationTransitionNamespace.prototype.destroy = function (context) {
        this.players.forEach(function (p) { return p.destroy(); });
        this._signalRemovalForInnerTriggers(this.hostElement, context);
    };
    AnimationTransitionNamespace.prototype.elementContainsData = function (element) {
        var containsData = false;
        if (this._elementListeners.has(element))
            containsData = true;
        containsData =
            (this._queue.find(function (entry) { return entry.element === element; }) ? true : false) || containsData;
        return containsData;
    };
    return AnimationTransitionNamespace;
}());
export { AnimationTransitionNamespace };
var TransitionAnimationEngine = /** @class */ (function () {
    function TransitionAnimationEngine(bodyNode, driver, _normalizer) {
        this.bodyNode = bodyNode;
        this.driver = driver;
        this._normalizer = _normalizer;
        this.players = [];
        this.newHostElements = new Map();
        this.playersByElement = new Map();
        this.playersByQueriedElement = new Map();
        this.statesByElement = new Map();
        this.disabledNodes = new Set();
        this.totalAnimations = 0;
        this.totalQueuedPlayers = 0;
        this._namespaceLookup = {};
        this._namespaceList = [];
        this._flushFns = [];
        this._whenQuietFns = [];
        this.namespacesByHostElement = new Map();
        this.collectedEnterElements = [];
        this.collectedLeaveElements = [];
        // this method is designed to be overridden by the code that uses this engine
        this.onRemovalComplete = function (element, context) { };
    }
    /** @internal */
    TransitionAnimationEngine.prototype._onRemovalComplete = function (element, context) { this.onRemovalComplete(element, context); };
    Object.defineProperty(TransitionAnimationEngine.prototype, "queuedPlayers", {
        get: function () {
            var players = [];
            this._namespaceList.forEach(function (ns) {
                ns.players.forEach(function (player) {
                    if (player.queued) {
                        players.push(player);
                    }
                });
            });
            return players;
        },
        enumerable: true,
        configurable: true
    });
    TransitionAnimationEngine.prototype.createNamespace = function (namespaceId, hostElement) {
        var ns = new AnimationTransitionNamespace(namespaceId, hostElement, this);
        if (hostElement.parentNode) {
            this._balanceNamespaceList(ns, hostElement);
        }
        else {
            // defer this later until flush during when the host element has
            // been inserted so that we know exactly where to place it in
            // the namespace list
            this.newHostElements.set(hostElement, ns);
            // given that this host element is apart of the animation code, it
            // may or may not be inserted by a parent node that is an of an
            // animation renderer type. If this happens then we can still have
            // access to this item when we query for :enter nodes. If the parent
            // is a renderer then the set data-structure will normalize the entry
            this.collectEnterElement(hostElement);
        }
        return this._namespaceLookup[namespaceId] = ns;
    };
    TransitionAnimationEngine.prototype._balanceNamespaceList = function (ns, hostElement) {
        var limit = this._namespaceList.length - 1;
        if (limit >= 0) {
            var found = false;
            for (var i = limit; i >= 0; i--) {
                var nextNamespace = this._namespaceList[i];
                if (this.driver.containsElement(nextNamespace.hostElement, hostElement)) {
                    this._namespaceList.splice(i + 1, 0, ns);
                    found = true;
                    break;
                }
            }
            if (!found) {
                this._namespaceList.splice(0, 0, ns);
            }
        }
        else {
            this._namespaceList.push(ns);
        }
        this.namespacesByHostElement.set(hostElement, ns);
        return ns;
    };
    TransitionAnimationEngine.prototype.register = function (namespaceId, hostElement) {
        var ns = this._namespaceLookup[namespaceId];
        if (!ns) {
            ns = this.createNamespace(namespaceId, hostElement);
        }
        return ns;
    };
    TransitionAnimationEngine.prototype.registerTrigger = function (namespaceId, name, trigger) {
        var ns = this._namespaceLookup[namespaceId];
        if (ns && ns.register(name, trigger)) {
            this.totalAnimations++;
        }
    };
    TransitionAnimationEngine.prototype.destroy = function (namespaceId, context) {
        var _this = this;
        if (!namespaceId)
            return;
        var ns = this._fetchNamespace(namespaceId);
        this.afterFlush(function () {
            _this.namespacesByHostElement.delete(ns.hostElement);
            delete _this._namespaceLookup[namespaceId];
            var index = _this._namespaceList.indexOf(ns);
            if (index >= 0) {
                _this._namespaceList.splice(index, 1);
            }
        });
        this.afterFlushAnimationsDone(function () { return ns.destroy(context); });
    };
    TransitionAnimationEngine.prototype._fetchNamespace = function (id) { return this._namespaceLookup[id]; };
    TransitionAnimationEngine.prototype.fetchNamespacesByElement = function (element) {
        // normally there should only be one namespace per element, however
        // if @triggers are placed on both the component element and then
        // its host element (within the component code) then there will be
        // two namespaces returned. We use a set here to simply the dedupe
        // of namespaces incase there are multiple triggers both the elm and host
        var namespaces = new Set();
        var elementStates = this.statesByElement.get(element);
        if (elementStates) {
            var keys = Object.keys(elementStates);
            for (var i = 0; i < keys.length; i++) {
                var nsId = elementStates[keys[i]].namespaceId;
                if (nsId) {
                    var ns = this._fetchNamespace(nsId);
                    if (ns) {
                        namespaces.add(ns);
                    }
                }
            }
        }
        return namespaces;
    };
    TransitionAnimationEngine.prototype.trigger = function (namespaceId, element, name, value) {
        if (isElementNode(element)) {
            var ns = this._fetchNamespace(namespaceId);
            if (ns) {
                ns.trigger(element, name, value);
                return true;
            }
        }
        return false;
    };
    TransitionAnimationEngine.prototype.insertNode = function (namespaceId, element, parent, insertBefore) {
        if (!isElementNode(element))
            return;
        // special case for when an element is removed and reinserted (move operation)
        // when this occurs we do not want to use the element for deletion later
        var details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval) {
            details.setForRemoval = false;
            details.setForMove = true;
            var index = this.collectedLeaveElements.indexOf(element);
            if (index >= 0) {
                this.collectedLeaveElements.splice(index, 1);
            }
        }
        // in the event that the namespaceId is blank then the caller
        // code does not contain any animation code in it, but it is
        // just being called so that the node is marked as being inserted
        if (namespaceId) {
            var ns = this._fetchNamespace(namespaceId);
            // This if-statement is a workaround for router issue #21947.
            // The router sometimes hits a race condition where while a route
            // is being instantiated a new navigation arrives, triggering leave
            // animation of DOM that has not been fully initialized, until this
            // is resolved, we need to handle the scenario when DOM is not in a
            // consistent state during the animation.
            if (ns) {
                ns.insertNode(element, parent);
            }
        }
        // only *directives and host elements are inserted before
        if (insertBefore) {
            this.collectEnterElement(element);
        }
    };
    TransitionAnimationEngine.prototype.collectEnterElement = function (element) { this.collectedEnterElements.push(element); };
    TransitionAnimationEngine.prototype.markElementAsDisabled = function (element, value) {
        if (value) {
            if (!this.disabledNodes.has(element)) {
                this.disabledNodes.add(element);
                addClass(element, DISABLED_CLASSNAME);
            }
        }
        else if (this.disabledNodes.has(element)) {
            this.disabledNodes.delete(element);
            removeClass(element, DISABLED_CLASSNAME);
        }
    };
    TransitionAnimationEngine.prototype.removeNode = function (namespaceId, element, isHostElement, context) {
        if (isElementNode(element)) {
            var ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
            if (ns) {
                ns.removeNode(element, context);
            }
            else {
                this.markElementAsRemoved(namespaceId, element, false, context);
            }
            if (isHostElement) {
                var hostNS = this.namespacesByHostElement.get(element);
                if (hostNS && hostNS.id !== namespaceId) {
                    hostNS.removeNode(element, context);
                }
            }
        }
        else {
            this._onRemovalComplete(element, context);
        }
    };
    TransitionAnimationEngine.prototype.markElementAsRemoved = function (namespaceId, element, hasAnimation, context) {
        this.collectedLeaveElements.push(element);
        element[REMOVAL_FLAG] = {
            namespaceId: namespaceId,
            setForRemoval: context, hasAnimation: hasAnimation,
            removedBeforeQueried: false
        };
    };
    TransitionAnimationEngine.prototype.listen = function (namespaceId, element, name, phase, callback) {
        if (isElementNode(element)) {
            return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
        }
        return function () { };
    };
    TransitionAnimationEngine.prototype._buildInstruction = function (entry, subTimelines, enterClassName, leaveClassName, skipBuildAst) {
        return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines, skipBuildAst);
    };
    TransitionAnimationEngine.prototype.destroyInnerAnimations = function (containerElement) {
        var _this = this;
        var elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
        elements.forEach(function (element) { return _this.destroyActiveAnimationsForElement(element); });
        if (this.playersByQueriedElement.size == 0)
            return;
        elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
        elements.forEach(function (element) { return _this.finishActiveQueriedAnimationOnElement(element); });
    };
    TransitionAnimationEngine.prototype.destroyActiveAnimationsForElement = function (element) {
        var players = this.playersByElement.get(element);
        if (players) {
            players.forEach(function (player) {
                // special case for when an element is set for destruction, but hasn't started.
                // in this situation we want to delay the destruction until the flush occurs
                // so that any event listeners attached to the player are triggered.
                if (player.queued) {
                    player.markedForDestroy = true;
                }
                else {
                    player.destroy();
                }
            });
        }
    };
    TransitionAnimationEngine.prototype.finishActiveQueriedAnimationOnElement = function (element) {
        var players = this.playersByQueriedElement.get(element);
        if (players) {
            players.forEach(function (player) { return player.finish(); });
        }
    };
    TransitionAnimationEngine.prototype.whenRenderingDone = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.players.length) {
                return optimizeGroupPlayer(_this.players).onDone(function () { return resolve(); });
            }
            else {
                resolve();
            }
        });
    };
    TransitionAnimationEngine.prototype.processLeaveNode = function (element) {
        var _this = this;
        var details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval) {
            // this will prevent it from removing it twice
            element[REMOVAL_FLAG] = NULL_REMOVAL_STATE;
            if (details.namespaceId) {
                this.destroyInnerAnimations(element);
                var ns = this._fetchNamespace(details.namespaceId);
                if (ns) {
                    ns.clearElementCache(element);
                }
            }
            this._onRemovalComplete(element, details.setForRemoval);
        }
        if (this.driver.matchesElement(element, DISABLED_SELECTOR)) {
            this.markElementAsDisabled(element, false);
        }
        this.driver.query(element, DISABLED_SELECTOR, true).forEach(function (node) {
            _this.markElementAsDisabled(node, false);
        });
    };
    TransitionAnimationEngine.prototype.flush = function (microtaskId) {
        var _this = this;
        if (microtaskId === void 0) { microtaskId = -1; }
        var players = [];
        if (this.newHostElements.size) {
            this.newHostElements.forEach(function (ns, element) { return _this._balanceNamespaceList(ns, element); });
            this.newHostElements.clear();
        }
        if (this.totalAnimations && this.collectedEnterElements.length) {
            for (var i = 0; i < this.collectedEnterElements.length; i++) {
                var elm = this.collectedEnterElements[i];
                addClass(elm, STAR_CLASSNAME);
            }
        }
        if (this._namespaceList.length &&
            (this.totalQueuedPlayers || this.collectedLeaveElements.length)) {
            var cleanupFns = [];
            try {
                players = this._flushAnimations(cleanupFns, microtaskId);
            }
            finally {
                for (var i = 0; i < cleanupFns.length; i++) {
                    cleanupFns[i]();
                }
            }
        }
        else {
            for (var i = 0; i < this.collectedLeaveElements.length; i++) {
                var element = this.collectedLeaveElements[i];
                this.processLeaveNode(element);
            }
        }
        this.totalQueuedPlayers = 0;
        this.collectedEnterElements.length = 0;
        this.collectedLeaveElements.length = 0;
        this._flushFns.forEach(function (fn) { return fn(); });
        this._flushFns = [];
        if (this._whenQuietFns.length) {
            // we move these over to a variable so that
            // if any new callbacks are registered in another
            // flush they do not populate the existing set
            var quietFns_1 = this._whenQuietFns;
            this._whenQuietFns = [];
            if (players.length) {
                optimizeGroupPlayer(players).onDone(function () { quietFns_1.forEach(function (fn) { return fn(); }); });
            }
            else {
                quietFns_1.forEach(function (fn) { return fn(); });
            }
        }
    };
    TransitionAnimationEngine.prototype.reportError = function (errors) {
        throw new Error("Unable to process animations due to the following failed trigger transitions\n " + errors.join('\n'));
    };
    TransitionAnimationEngine.prototype._flushAnimations = function (cleanupFns, microtaskId) {
        var _this = this;
        var subTimelines = new ElementInstructionMap();
        var skippedPlayers = [];
        var skippedPlayersMap = new Map();
        var queuedInstructions = [];
        var queriedElements = new Map();
        var allPreStyleElements = new Map();
        var allPostStyleElements = new Map();
        var disabledElementsSet = new Set();
        this.disabledNodes.forEach(function (node) {
            disabledElementsSet.add(node);
            var nodesThatAreDisabled = _this.driver.query(node, QUEUED_SELECTOR, true);
            for (var i_1 = 0; i_1 < nodesThatAreDisabled.length; i_1++) {
                disabledElementsSet.add(nodesThatAreDisabled[i_1]);
            }
        });
        var bodyNode = this.bodyNode;
        var allTriggerElements = Array.from(this.statesByElement.keys());
        var enterNodeMap = buildRootMap(allTriggerElements, this.collectedEnterElements);
        // this must occur before the instructions are built below such that
        // the :enter queries match the elements (since the timeline queries
        // are fired during instruction building).
        var enterNodeMapIds = new Map();
        var i = 0;
        enterNodeMap.forEach(function (nodes, root) {
            var className = ENTER_CLASSNAME + i++;
            enterNodeMapIds.set(root, className);
            nodes.forEach(function (node) { return addClass(node, className); });
        });
        var allLeaveNodes = [];
        var mergedLeaveNodes = new Set();
        var leaveNodesWithoutAnimations = new Set();
        for (var i_2 = 0; i_2 < this.collectedLeaveElements.length; i_2++) {
            var element = this.collectedLeaveElements[i_2];
            var details = element[REMOVAL_FLAG];
            if (details && details.setForRemoval) {
                allLeaveNodes.push(element);
                mergedLeaveNodes.add(element);
                if (details.hasAnimation) {
                    this.driver.query(element, STAR_SELECTOR, true).forEach(function (elm) { return mergedLeaveNodes.add(elm); });
                }
                else {
                    leaveNodesWithoutAnimations.add(element);
                }
            }
        }
        var leaveNodeMapIds = new Map();
        var leaveNodeMap = buildRootMap(allTriggerElements, Array.from(mergedLeaveNodes));
        leaveNodeMap.forEach(function (nodes, root) {
            var className = LEAVE_CLASSNAME + i++;
            leaveNodeMapIds.set(root, className);
            nodes.forEach(function (node) { return addClass(node, className); });
        });
        cleanupFns.push(function () {
            enterNodeMap.forEach(function (nodes, root) {
                var className = enterNodeMapIds.get(root);
                nodes.forEach(function (node) { return removeClass(node, className); });
            });
            leaveNodeMap.forEach(function (nodes, root) {
                var className = leaveNodeMapIds.get(root);
                nodes.forEach(function (node) { return removeClass(node, className); });
            });
            allLeaveNodes.forEach(function (element) { _this.processLeaveNode(element); });
        });
        var allPlayers = [];
        var erroneousTransitions = [];
        for (var i_3 = this._namespaceList.length - 1; i_3 >= 0; i_3--) {
            var ns = this._namespaceList[i_3];
            ns.drainQueuedTransitions(microtaskId).forEach(function (entry) {
                var player = entry.player;
                var element = entry.element;
                allPlayers.push(player);
                if (_this.collectedEnterElements.length) {
                    var details = element[REMOVAL_FLAG];
                    // move animations are currently not supported...
                    if (details && details.setForMove) {
                        player.destroy();
                        return;
                    }
                }
                var nodeIsOrphaned = !bodyNode || !_this.driver.containsElement(bodyNode, element);
                var leaveClassName = leaveNodeMapIds.get(element);
                var enterClassName = enterNodeMapIds.get(element);
                var instruction = _this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName, nodeIsOrphaned);
                if (instruction.errors && instruction.errors.length) {
                    erroneousTransitions.push(instruction);
                    return;
                }
                // even though the element may not be apart of the DOM, it may
                // still be added at a later point (due to the mechanics of content
                // projection and/or dynamic component insertion) therefore it's
                // important we still style the element.
                if (nodeIsOrphaned) {
                    player.onStart(function () { return eraseStyles(element, instruction.fromStyles); });
                    player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
                    skippedPlayers.push(player);
                    return;
                }
                // if a unmatched transition is queued to go then it SHOULD NOT render
                // an animation and cancel the previously running animations.
                if (entry.isFallbackTransition) {
                    player.onStart(function () { return eraseStyles(element, instruction.fromStyles); });
                    player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
                    skippedPlayers.push(player);
                    return;
                }
                // this means that if a parent animation uses this animation as a sub trigger
                // then it will instruct the timeline builder to not add a player delay, but
                // instead stretch the first keyframe gap up until the animation starts. The
                // reason this is important is to prevent extra initialization styles from being
                // required by the user in the animation.
                instruction.timelines.forEach(function (tl) { return tl.stretchStartingKeyframe = true; });
                subTimelines.append(element, instruction.timelines);
                var tuple = { instruction: instruction, player: player, element: element };
                queuedInstructions.push(tuple);
                instruction.queriedElements.forEach(function (element) { return getOrSetAsInMap(queriedElements, element, []).push(player); });
                instruction.preStyleProps.forEach(function (stringMap, element) {
                    var props = Object.keys(stringMap);
                    if (props.length) {
                        var setVal_1 = allPreStyleElements.get(element);
                        if (!setVal_1) {
                            allPreStyleElements.set(element, setVal_1 = new Set());
                        }
                        props.forEach(function (prop) { return setVal_1.add(prop); });
                    }
                });
                instruction.postStyleProps.forEach(function (stringMap, element) {
                    var props = Object.keys(stringMap);
                    var setVal = allPostStyleElements.get(element);
                    if (!setVal) {
                        allPostStyleElements.set(element, setVal = new Set());
                    }
                    props.forEach(function (prop) { return setVal.add(prop); });
                });
            });
        }
        if (erroneousTransitions.length) {
            var errors_1 = [];
            erroneousTransitions.forEach(function (instruction) {
                errors_1.push("@" + instruction.triggerName + " has failed due to:\n");
                instruction.errors.forEach(function (error) { return errors_1.push("- " + error + "\n"); });
            });
            allPlayers.forEach(function (player) { return player.destroy(); });
            this.reportError(errors_1);
        }
        var allPreviousPlayersMap = new Map();
        // this map works to tell which element in the DOM tree is contained by
        // which animation. Further down below this map will get populated once
        // the players are built and in doing so it can efficiently figure out
        // if a sub player is skipped due to a parent player having priority.
        var animationElementMap = new Map();
        queuedInstructions.forEach(function (entry) {
            var element = entry.element;
            if (subTimelines.has(element)) {
                animationElementMap.set(element, element);
                _this._beforeAnimationBuild(entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
            }
        });
        skippedPlayers.forEach(function (player) {
            var element = player.element;
            var previousPlayers = _this._getPreviousPlayers(element, false, player.namespaceId, player.triggerName, null);
            previousPlayers.forEach(function (prevPlayer) {
                getOrSetAsInMap(allPreviousPlayersMap, element, []).push(prevPlayer);
                prevPlayer.destroy();
            });
        });
        // this is a special case for nodes that will be removed (either by)
        // having their own leave animations or by being queried in a container
        // that will be removed once a parent animation is complete. The idea
        // here is that * styles must be identical to ! styles because of
        // backwards compatibility (* is also filled in by default in many places).
        // Otherwise * styles will return an empty value or auto since the element
        // that is being getComputedStyle'd will not be visible (since * = destination)
        var replaceNodes = allLeaveNodes.filter(function (node) {
            return replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements);
        });
        // POST STAGE: fill the * styles
        var postStylesMap = new Map();
        var allLeaveQueriedNodes = cloakAndComputeStyles(postStylesMap, this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);
        allLeaveQueriedNodes.forEach(function (node) {
            if (replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements)) {
                replaceNodes.push(node);
            }
        });
        // PRE STAGE: fill the ! styles
        var preStylesMap = new Map();
        enterNodeMap.forEach(function (nodes, root) {
            cloakAndComputeStyles(preStylesMap, _this.driver, new Set(nodes), allPreStyleElements, PRE_STYLE);
        });
        replaceNodes.forEach(function (node) {
            var post = postStylesMap.get(node);
            var pre = preStylesMap.get(node);
            postStylesMap.set(node, __assign(__assign({}, post), pre));
        });
        var rootPlayers = [];
        var subPlayers = [];
        var NO_PARENT_ANIMATION_ELEMENT_DETECTED = {};
        queuedInstructions.forEach(function (entry) {
            var element = entry.element, player = entry.player, instruction = entry.instruction;
            // this means that it was never consumed by a parent animation which
            // means that it is independent and therefore should be set for animation
            if (subTimelines.has(element)) {
                if (disabledElementsSet.has(element)) {
                    player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
                    player.disabled = true;
                    player.overrideTotalTime(instruction.totalTime);
                    skippedPlayers.push(player);
                    return;
                }
                // this will flow up the DOM and query the map to figure out
                // if a parent animation has priority over it. In the situation
                // that a parent is detected then it will cancel the loop. If
                // nothing is detected, or it takes a few hops to find a parent,
                // then it will fill in the missing nodes and signal them as having
                // a detected parent (or a NO_PARENT value via a special constant).
                var parentWithAnimation_1 = NO_PARENT_ANIMATION_ELEMENT_DETECTED;
                if (animationElementMap.size > 1) {
                    var elm = element;
                    var parentsToAdd = [];
                    while (elm = elm.parentNode) {
                        var detectedParent = animationElementMap.get(elm);
                        if (detectedParent) {
                            parentWithAnimation_1 = detectedParent;
                            break;
                        }
                        parentsToAdd.push(elm);
                    }
                    parentsToAdd.forEach(function (parent) { return animationElementMap.set(parent, parentWithAnimation_1); });
                }
                var innerPlayer = _this._buildAnimation(player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap);
                player.setRealPlayer(innerPlayer);
                if (parentWithAnimation_1 === NO_PARENT_ANIMATION_ELEMENT_DETECTED) {
                    rootPlayers.push(player);
                }
                else {
                    var parentPlayers = _this.playersByElement.get(parentWithAnimation_1);
                    if (parentPlayers && parentPlayers.length) {
                        player.parentPlayer = optimizeGroupPlayer(parentPlayers);
                    }
                    skippedPlayers.push(player);
                }
            }
            else {
                eraseStyles(element, instruction.fromStyles);
                player.onDestroy(function () { return setStyles(element, instruction.toStyles); });
                // there still might be a ancestor player animating this
                // element therefore we will still add it as a sub player
                // even if its animation may be disabled
                subPlayers.push(player);
                if (disabledElementsSet.has(element)) {
                    skippedPlayers.push(player);
                }
            }
        });
        // find all of the sub players' corresponding inner animation player
        subPlayers.forEach(function (player) {
            // even if any players are not found for a sub animation then it
            // will still complete itself after the next tick since it's Noop
            var playersForElement = skippedPlayersMap.get(player.element);
            if (playersForElement && playersForElement.length) {
                var innerPlayer = optimizeGroupPlayer(playersForElement);
                player.setRealPlayer(innerPlayer);
            }
        });
        // the reason why we don't actually play the animation is
        // because all that a skipped player is designed to do is to
        // fire the start/done transition callback events
        skippedPlayers.forEach(function (player) {
            if (player.parentPlayer) {
                player.syncPlayerEvents(player.parentPlayer);
            }
            else {
                player.destroy();
            }
        });
        // run through all of the queued removals and see if they
        // were picked up by a query. If not then perform the removal
        // operation right away unless a parent animation is ongoing.
        for (var i_4 = 0; i_4 < allLeaveNodes.length; i_4++) {
            var element = allLeaveNodes[i_4];
            var details = element[REMOVAL_FLAG];
            removeClass(element, LEAVE_CLASSNAME);
            // this means the element has a removal animation that is being
            // taken care of and therefore the inner elements will hang around
            // until that animation is over (or the parent queried animation)
            if (details && details.hasAnimation)
                continue;
            var players = [];
            // if this element is queried or if it contains queried children
            // then we want for the element not to be removed from the page
            // until the queried animations have finished
            if (queriedElements.size) {
                var queriedPlayerResults = queriedElements.get(element);
                if (queriedPlayerResults && queriedPlayerResults.length) {
                    players.push.apply(players, __spread(queriedPlayerResults));
                }
                var queriedInnerElements = this.driver.query(element, NG_ANIMATING_SELECTOR, true);
                for (var j = 0; j < queriedInnerElements.length; j++) {
                    var queriedPlayers = queriedElements.get(queriedInnerElements[j]);
                    if (queriedPlayers && queriedPlayers.length) {
                        players.push.apply(players, __spread(queriedPlayers));
                    }
                }
            }
            var activePlayers = players.filter(function (p) { return !p.destroyed; });
            if (activePlayers.length) {
                removeNodesAfterAnimationDone(this, element, activePlayers);
            }
            else {
                this.processLeaveNode(element);
            }
        }
        // this is required so the cleanup method doesn't remove them
        allLeaveNodes.length = 0;
        rootPlayers.forEach(function (player) {
            _this.players.push(player);
            player.onDone(function () {
                player.destroy();
                var index = _this.players.indexOf(player);
                _this.players.splice(index, 1);
            });
            player.play();
        });
        return rootPlayers;
    };
    TransitionAnimationEngine.prototype.elementContainsData = function (namespaceId, element) {
        var containsData = false;
        var details = element[REMOVAL_FLAG];
        if (details && details.setForRemoval)
            containsData = true;
        if (this.playersByElement.has(element))
            containsData = true;
        if (this.playersByQueriedElement.has(element))
            containsData = true;
        if (this.statesByElement.has(element))
            containsData = true;
        return this._fetchNamespace(namespaceId).elementContainsData(element) || containsData;
    };
    TransitionAnimationEngine.prototype.afterFlush = function (callback) { this._flushFns.push(callback); };
    TransitionAnimationEngine.prototype.afterFlushAnimationsDone = function (callback) { this._whenQuietFns.push(callback); };
    TransitionAnimationEngine.prototype._getPreviousPlayers = function (element, isQueriedElement, namespaceId, triggerName, toStateValue) {
        var players = [];
        if (isQueriedElement) {
            var queriedElementPlayers = this.playersByQueriedElement.get(element);
            if (queriedElementPlayers) {
                players = queriedElementPlayers;
            }
        }
        else {
            var elementPlayers = this.playersByElement.get(element);
            if (elementPlayers) {
                var isRemovalAnimation_1 = !toStateValue || toStateValue == VOID_VALUE;
                elementPlayers.forEach(function (player) {
                    if (player.queued)
                        return;
                    if (!isRemovalAnimation_1 && player.triggerName != triggerName)
                        return;
                    players.push(player);
                });
            }
        }
        if (namespaceId || triggerName) {
            players = players.filter(function (player) {
                if (namespaceId && namespaceId != player.namespaceId)
                    return false;
                if (triggerName && triggerName != player.triggerName)
                    return false;
                return true;
            });
        }
        return players;
    };
    TransitionAnimationEngine.prototype._beforeAnimationBuild = function (namespaceId, instruction, allPreviousPlayersMap) {
        var e_1, _a;
        var triggerName = instruction.triggerName;
        var rootElement = instruction.element;
        // when a removal animation occurs, ALL previous players are collected
        // and destroyed (even if they are outside of the current namespace)
        var targetNameSpaceId = instruction.isRemovalTransition ? undefined : namespaceId;
        var targetTriggerName = instruction.isRemovalTransition ? undefined : triggerName;
        var _loop_1 = function (timelineInstruction) {
            var element = timelineInstruction.element;
            var isQueriedElement = element !== rootElement;
            var players = getOrSetAsInMap(allPreviousPlayersMap, element, []);
            var previousPlayers = this_1._getPreviousPlayers(element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
            previousPlayers.forEach(function (player) {
                var realPlayer = player.getRealPlayer();
                if (realPlayer.beforeDestroy) {
                    realPlayer.beforeDestroy();
                }
                player.destroy();
                players.push(player);
            });
        };
        var this_1 = this;
        try {
            for (var _b = __values(instruction.timelines), _c = _b.next(); !_c.done; _c = _b.next()) {
                var timelineInstruction = _c.value;
                _loop_1(timelineInstruction);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // this needs to be done so that the PRE/POST styles can be
        // computed properly without interfering with the previous animation
        eraseStyles(rootElement, instruction.fromStyles);
    };
    TransitionAnimationEngine.prototype._buildAnimation = function (namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap) {
        var _this = this;
        var triggerName = instruction.triggerName;
        var rootElement = instruction.element;
        // we first run this so that the previous animation player
        // data can be passed into the successive animation players
        var allQueriedPlayers = [];
        var allConsumedElements = new Set();
        var allSubElements = new Set();
        var allNewPlayers = instruction.timelines.map(function (timelineInstruction) {
            var element = timelineInstruction.element;
            allConsumedElements.add(element);
            // FIXME (matsko): make sure to-be-removed animations are removed properly
            var details = element[REMOVAL_FLAG];
            if (details && details.removedBeforeQueried)
                return new NoopAnimationPlayer(timelineInstruction.duration, timelineInstruction.delay);
            var isQueriedElement = element !== rootElement;
            var previousPlayers = flattenGroupPlayers((allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY)
                .map(function (p) { return p.getRealPlayer(); }))
                .filter(function (p) {
                // the `element` is not apart of the AnimationPlayer definition, but
                // Mock/WebAnimations
                // use the element within their implementation. This will be added in Angular5 to
                // AnimationPlayer
                var pp = p;
                return pp.element ? pp.element === element : false;
            });
            var preStyles = preStylesMap.get(element);
            var postStyles = postStylesMap.get(element);
            var keyframes = normalizeKeyframes(_this.driver, _this._normalizer, element, timelineInstruction.keyframes, preStyles, postStyles);
            var player = _this._buildPlayer(timelineInstruction, keyframes, previousPlayers);
            // this means that this particular player belongs to a sub trigger. It is
            // important that we match this player up with the corresponding (@trigger.listener)
            if (timelineInstruction.subTimeline && skippedPlayersMap) {
                allSubElements.add(element);
            }
            if (isQueriedElement) {
                var wrappedPlayer = new TransitionAnimationPlayer(namespaceId, triggerName, element);
                wrappedPlayer.setRealPlayer(player);
                allQueriedPlayers.push(wrappedPlayer);
            }
            return player;
        });
        allQueriedPlayers.forEach(function (player) {
            getOrSetAsInMap(_this.playersByQueriedElement, player.element, []).push(player);
            player.onDone(function () { return deleteOrUnsetInMap(_this.playersByQueriedElement, player.element, player); });
        });
        allConsumedElements.forEach(function (element) { return addClass(element, NG_ANIMATING_CLASSNAME); });
        var player = optimizeGroupPlayer(allNewPlayers);
        player.onDestroy(function () {
            allConsumedElements.forEach(function (element) { return removeClass(element, NG_ANIMATING_CLASSNAME); });
            setStyles(rootElement, instruction.toStyles);
        });
        // this basically makes all of the callbacks for sub element animations
        // be dependent on the upper players for when they finish
        allSubElements.forEach(function (element) { getOrSetAsInMap(skippedPlayersMap, element, []).push(player); });
        return player;
    };
    TransitionAnimationEngine.prototype._buildPlayer = function (instruction, keyframes, previousPlayers) {
        if (keyframes.length > 0) {
            return this.driver.animate(instruction.element, keyframes, instruction.duration, instruction.delay, instruction.easing, previousPlayers);
        }
        // special case for when an empty transition|definition is provided
        // ... there is no point in rendering an empty animation
        return new NoopAnimationPlayer(instruction.duration, instruction.delay);
    };
    return TransitionAnimationEngine;
}());
export { TransitionAnimationEngine };
var TransitionAnimationPlayer = /** @class */ (function () {
    function TransitionAnimationPlayer(namespaceId, triggerName, element) {
        this.namespaceId = namespaceId;
        this.triggerName = triggerName;
        this.element = element;
        this._player = new NoopAnimationPlayer();
        this._containsRealPlayer = false;
        this._queuedCallbacks = {};
        this.destroyed = false;
        this.markedForDestroy = false;
        this.disabled = false;
        this.queued = true;
        this.totalTime = 0;
    }
    TransitionAnimationPlayer.prototype.setRealPlayer = function (player) {
        var _this = this;
        if (this._containsRealPlayer)
            return;
        this._player = player;
        Object.keys(this._queuedCallbacks).forEach(function (phase) {
            _this._queuedCallbacks[phase].forEach(function (callback) { return listenOnPlayer(player, phase, undefined, callback); });
        });
        this._queuedCallbacks = {};
        this._containsRealPlayer = true;
        this.overrideTotalTime(player.totalTime);
        this.queued = false;
    };
    TransitionAnimationPlayer.prototype.getRealPlayer = function () { return this._player; };
    TransitionAnimationPlayer.prototype.overrideTotalTime = function (totalTime) { this.totalTime = totalTime; };
    TransitionAnimationPlayer.prototype.syncPlayerEvents = function (player) {
        var _this = this;
        var p = this._player;
        if (p.triggerCallback) {
            player.onStart(function () { return p.triggerCallback('start'); });
        }
        player.onDone(function () { return _this.finish(); });
        player.onDestroy(function () { return _this.destroy(); });
    };
    TransitionAnimationPlayer.prototype._queueEvent = function (name, callback) {
        getOrSetAsInMap(this._queuedCallbacks, name, []).push(callback);
    };
    TransitionAnimationPlayer.prototype.onDone = function (fn) {
        if (this.queued) {
            this._queueEvent('done', fn);
        }
        this._player.onDone(fn);
    };
    TransitionAnimationPlayer.prototype.onStart = function (fn) {
        if (this.queued) {
            this._queueEvent('start', fn);
        }
        this._player.onStart(fn);
    };
    TransitionAnimationPlayer.prototype.onDestroy = function (fn) {
        if (this.queued) {
            this._queueEvent('destroy', fn);
        }
        this._player.onDestroy(fn);
    };
    TransitionAnimationPlayer.prototype.init = function () { this._player.init(); };
    TransitionAnimationPlayer.prototype.hasStarted = function () { return this.queued ? false : this._player.hasStarted(); };
    TransitionAnimationPlayer.prototype.play = function () { !this.queued && this._player.play(); };
    TransitionAnimationPlayer.prototype.pause = function () { !this.queued && this._player.pause(); };
    TransitionAnimationPlayer.prototype.restart = function () { !this.queued && this._player.restart(); };
    TransitionAnimationPlayer.prototype.finish = function () { this._player.finish(); };
    TransitionAnimationPlayer.prototype.destroy = function () {
        this.destroyed = true;
        this._player.destroy();
    };
    TransitionAnimationPlayer.prototype.reset = function () { !this.queued && this._player.reset(); };
    TransitionAnimationPlayer.prototype.setPosition = function (p) {
        if (!this.queued) {
            this._player.setPosition(p);
        }
    };
    TransitionAnimationPlayer.prototype.getPosition = function () { return this.queued ? 0 : this._player.getPosition(); };
    /** @internal */
    TransitionAnimationPlayer.prototype.triggerCallback = function (phaseName) {
        var p = this._player;
        if (p.triggerCallback) {
            p.triggerCallback(phaseName);
        }
    };
    return TransitionAnimationPlayer;
}());
export { TransitionAnimationPlayer };
function deleteOrUnsetInMap(map, key, value) {
    var currentValues;
    if (map instanceof Map) {
        currentValues = map.get(key);
        if (currentValues) {
            if (currentValues.length) {
                var index = currentValues.indexOf(value);
                currentValues.splice(index, 1);
            }
            if (currentValues.length == 0) {
                map.delete(key);
            }
        }
    }
    else {
        currentValues = map[key];
        if (currentValues) {
            if (currentValues.length) {
                var index = currentValues.indexOf(value);
                currentValues.splice(index, 1);
            }
            if (currentValues.length == 0) {
                delete map[key];
            }
        }
    }
    return currentValues;
}
function normalizeTriggerValue(value) {
    // we use `!= null` here because it's the most simple
    // way to test against a "falsy" value without mixing
    // in empty strings or a zero value. DO NOT OPTIMIZE.
    return value != null ? value : null;
}
function isElementNode(node) {
    return node && node['nodeType'] === 1;
}
function isTriggerEventValid(eventName) {
    return eventName == 'start' || eventName == 'done';
}
function cloakElement(element, value) {
    var oldValue = element.style.display;
    element.style.display = value != null ? value : 'none';
    return oldValue;
}
function cloakAndComputeStyles(valuesMap, driver, elements, elementPropsMap, defaultStyle) {
    var cloakVals = [];
    elements.forEach(function (element) { return cloakVals.push(cloakElement(element)); });
    var failedElements = [];
    elementPropsMap.forEach(function (props, element) {
        var styles = {};
        props.forEach(function (prop) {
            var value = styles[prop] = driver.computeStyle(element, prop, defaultStyle);
            // there is no easy way to detect this because a sub element could be removed
            // by a parent animation element being detached.
            if (!value || value.length == 0) {
                element[REMOVAL_FLAG] = NULL_REMOVED_QUERIED_STATE;
                failedElements.push(element);
            }
        });
        valuesMap.set(element, styles);
    });
    // we use a index variable here since Set.forEach(a, i) does not return
    // an index value for the closure (but instead just the value)
    var i = 0;
    elements.forEach(function (element) { return cloakElement(element, cloakVals[i++]); });
    return failedElements;
}
/*
Since the Angular renderer code will return a collection of inserted
nodes in all areas of a DOM tree, it's up to this algorithm to figure
out which nodes are roots for each animation @trigger.

By placing each inserted node into a Set and traversing upwards, it
is possible to find the @trigger elements and well any direct *star
insertion nodes, if a @trigger root is found then the enter element
is placed into the Map[@trigger] spot.
 */
function buildRootMap(roots, nodes) {
    var rootMap = new Map();
    roots.forEach(function (root) { return rootMap.set(root, []); });
    if (nodes.length == 0)
        return rootMap;
    var NULL_NODE = 1;
    var nodeSet = new Set(nodes);
    var localRootMap = new Map();
    function getRoot(node) {
        if (!node)
            return NULL_NODE;
        var root = localRootMap.get(node);
        if (root)
            return root;
        var parent = node.parentNode;
        if (rootMap.has(parent)) { // ngIf inside @trigger
            root = parent;
        }
        else if (nodeSet.has(parent)) { // ngIf inside ngIf
            root = NULL_NODE;
        }
        else { // recurse upwards
            root = getRoot(parent);
        }
        localRootMap.set(node, root);
        return root;
    }
    nodes.forEach(function (node) {
        var root = getRoot(node);
        if (root !== NULL_NODE) {
            rootMap.get(root).push(node);
        }
    });
    return rootMap;
}
var CLASSES_CACHE_KEY = '$$classes';
function containsClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className);
    }
    else {
        var classes = element[CLASSES_CACHE_KEY];
        return classes && classes[className];
    }
}
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    }
    else {
        var classes = element[CLASSES_CACHE_KEY];
        if (!classes) {
            classes = element[CLASSES_CACHE_KEY] = {};
        }
        classes[className] = true;
    }
}
function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    }
    else {
        var classes = element[CLASSES_CACHE_KEY];
        if (classes) {
            delete classes[className];
        }
    }
}
function removeNodesAfterAnimationDone(engine, element, players) {
    optimizeGroupPlayer(players).onDone(function () { return engine.processLeaveNode(element); });
}
function flattenGroupPlayers(players) {
    var finalPlayers = [];
    _flattenGroupPlayersRecur(players, finalPlayers);
    return finalPlayers;
}
function _flattenGroupPlayersRecur(players, finalPlayers) {
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player instanceof AnimationGroupPlayer) {
            _flattenGroupPlayersRecur(player.players, finalPlayers);
        }
        else {
            finalPlayers.push(player);
        }
    }
}
function objEquals(a, b) {
    var k1 = Object.keys(a);
    var k2 = Object.keys(b);
    if (k1.length != k2.length)
        return false;
    for (var i = 0; i < k1.length; i++) {
        var prop = k1[i];
        if (!b.hasOwnProperty(prop) || a[prop] !== b[prop])
            return false;
    }
    return true;
}
function replacePostStylesAsPre(element, allPreStyleElements, allPostStyleElements) {
    var postEntry = allPostStyleElements.get(element);
    if (!postEntry)
        return false;
    var preEntry = allPreStyleElements.get(element);
    if (preEntry) {
        postEntry.forEach(function (data) { return preEntry.add(data); });
    }
    else {
        allPreStyleElements.set(element, postEntry);
    }
    allPostStyleElements.delete(element);
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvdHJhbnNpdGlvbl9hbmltYXRpb25fZW5naW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsVUFBVSxFQUFxQyxtQkFBbUIsRUFBRSxxQkFBcUIsSUFBSSxvQkFBb0IsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFNM0wsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFFckUsT0FBTyxFQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBbUIsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBR3JNLE9BQU8sRUFBQyxlQUFlLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRXRILElBQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUM7QUFDN0MsSUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUM7QUFDN0MsSUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQztBQUNqRCxJQUFNLGlCQUFpQixHQUFHLHNCQUFzQixDQUFDO0FBQ2pELElBQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDO0FBQzFDLElBQU0sYUFBYSxHQUFHLG1CQUFtQixDQUFDO0FBRTFDLElBQU0sa0JBQWtCLEdBQWdDLEVBQUUsQ0FBQztBQUMzRCxJQUFNLGtCQUFrQixHQUEwQjtJQUNoRCxXQUFXLEVBQUUsRUFBRTtJQUNmLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLFVB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QUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2xDLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO0tBQ2xFO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FDM0IsT0FBWSxFQUFFLG1CQUEwQyxFQUN4RCxvQkFBMkM7SUFDN0MsSUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELElBQUksQ0FBQyxTQUFTO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFFN0IsSUFBSSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELElBQUksUUFBUSxFQUFFO1FBQ1osU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLFFBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQXBCLENBQW9CLENBQUMsQ0FBQztLQUNqRDtTQUFNO1FBQ0wsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztLQUM3QztJQUVELG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FVVE9fU1RZTEUsIEFuaW1hdGlvbk9wdGlvbnMsIEFuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciBhcyBBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uVGltZWxpbmVJbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90aW1lbGluZV9pbnN0cnVjdGlvbic7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5fSBmcm9tICcuLi9kc2wvYW5pbWF0aW9uX3RyYW5zaXRpb25fZmFjdG9yeSc7XG5pbXBvcnQge0FuaW1hdGlvblRyYW5zaXRpb25JbnN0cnVjdGlvbn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmFuc2l0aW9uX2luc3RydWN0aW9uJztcbmltcG9ydCB7QW5pbWF0aW9uVHJpZ2dlcn0gZnJvbSAnLi4vZHNsL2FuaW1hdGlvbl90cmlnZ2VyJztcbmltcG9ydCB7RWxlbWVudEluc3RydWN0aW9uTWFwfSBmcm9tICcuLi9kc2wvZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAnO1xuaW1wb3J0IHtBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXJ9IGZyb20gJy4uL2RzbC9zdHlsZV9ub3JtYWxpemF0aW9uL2FuaW1hdGlvbl9zdHlsZV9ub3JtYWxpemVyJztcbmltcG9ydCB7RU5URVJfQ0xBU1NOQU1FLCBMRUFWRV9DTEFTU05BTUUsIE5HX0FOSU1BVElOR19DTEFTU05BTUUsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgTkdfVFJJR0dFUl9DTEFTU05BTUUsIE5HX1RSSUdHRVJfU0VMRUNUT1IsIGNvcHlPYmosIGVyYXNlU3R5bGVzLCBpdGVyYXRvclRvQXJyYXksIHNldFN0eWxlc30gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7QW5pbWF0aW9uRHJpdmVyfSBmcm9tICcuL2FuaW1hdGlvbl9kcml2ZXInO1xuaW1wb3J0IHtnZXRPclNldEFzSW5NYXAsIGxpc3Rlbk9uUGxheWVyLCBtYWtlQW5pbWF0aW9uRXZlbnQsIG5vcm1hbGl6ZUtleWZyYW1lcywgb3B0aW1pemVHcm91cFBsYXllcn0gZnJvbSAnLi9zaGFyZWQnO1xuXG5jb25zdCBRVUVVRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtcXVldWVkJztcbmNvbnN0IFFVRVVFRF9TRUxFQ1RPUiA9ICcubmctYW5pbWF0ZS1xdWV1ZWQnO1xuY29uc3QgRElTQUJMRURfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgRElTQUJMRURfU0VMRUNUT1IgPSAnLm5nLWFuaW1hdGUtZGlzYWJsZWQnO1xuY29uc3QgU1RBUl9DTEFTU05BTUUgPSAnbmctc3Rhci1pbnNlcnRlZCc7XG5jb25zdCBTVEFSX1NFTEVDVE9SID0gJy5uZy1zdGFyLWluc2VydGVkJztcblxuY29uc3QgRU1QVFlfUExBWUVSX0FSUkFZOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbmNvbnN0IE5VTExfUkVNT1ZBTF9TVEFURTogRWxlbWVudEFuaW1hdGlvblN0YXRlID0ge1xuICBuYW1lc3BhY2VJZDogJycsXG4gIHNldEZvclJlbW92YWw6IGZhbHNlLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgaGFzQW5pbWF0aW9uOiBmYWxzZSxcbiAgcmVtb3ZlZEJlZm9yZVF1ZXJpZWQ6IGZhbHNlXG59O1xuY29uc3QgTlVMTF9SRU1PVkVEX1FVRVJJRURfU1RBVEU6IEVsZW1lbnRBbmltYXRpb25TdGF0ZSA9IHtcbiAgbmFtZXNwYWNlSWQ6ICcnLFxuICBzZXRGb3JNb3ZlOiBmYWxzZSxcbiAgc2V0Rm9yUmVtb3ZhbDogZmFsc2UsXG4gIGhhc0FuaW1hdGlvbjogZmFsc2UsXG4gIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiB0cnVlXG59O1xuXG5pbnRlcmZhY2UgVHJpZ2dlckxpc3RlbmVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwaGFzZTogc3RyaW5nO1xuICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZUluc3RydWN0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICB0cmlnZ2VyTmFtZTogc3RyaW5nO1xuICBmcm9tU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRvU3RhdGU6IFN0YXRlVmFsdWU7XG4gIHRyYW5zaXRpb246IEFuaW1hdGlvblRyYW5zaXRpb25GYWN0b3J5O1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG4gIGlzRmFsbGJhY2tUcmFuc2l0aW9uOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgUkVNT1ZBTF9GTEFHID0gJ19fbmdfcmVtb3ZlZCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudEFuaW1hdGlvblN0YXRlIHtcbiAgc2V0Rm9yUmVtb3ZhbDogYm9vbGVhbjtcbiAgc2V0Rm9yTW92ZTogYm9vbGVhbjtcbiAgaGFzQW5pbWF0aW9uOiBib29sZWFuO1xuICBuYW1lc3BhY2VJZDogc3RyaW5nO1xuICByZW1vdmVkQmVmb3JlUXVlcmllZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFN0YXRlVmFsdWUge1xuICBwdWJsaWMgdmFsdWU6IHN0cmluZztcbiAgcHVibGljIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnM7XG5cbiAgZ2V0IHBhcmFtcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLm9wdGlvbnMucGFyYW1zIGFze1trZXk6IHN0cmluZ106IGFueX07IH1cblxuICBjb25zdHJ1Y3RvcihpbnB1dDogYW55LCBwdWJsaWMgbmFtZXNwYWNlSWQ6IHN0cmluZyA9ICcnKSB7XG4gICAgY29uc3QgaXNPYmogPSBpbnB1dCAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKTtcbiAgICBjb25zdCB2YWx1ZSA9IGlzT2JqID8gaW5wdXRbJ3ZhbHVlJ10gOiBpbnB1dDtcbiAgICB0aGlzLnZhbHVlID0gbm9ybWFsaXplVHJpZ2dlclZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNPYmopIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb3B5T2JqKGlucHV0IGFzIGFueSk7XG4gICAgICBkZWxldGUgb3B0aW9uc1sndmFsdWUnXTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgYXMgQW5pbWF0aW9uT3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnBhcmFtcykge1xuICAgICAgdGhpcy5vcHRpb25zLnBhcmFtcyA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGFic29yYk9wdGlvbnMob3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIGNvbnN0IG5ld1BhcmFtcyA9IG9wdGlvbnMucGFyYW1zO1xuICAgIGlmIChuZXdQYXJhbXMpIHtcbiAgICAgIGNvbnN0IG9sZFBhcmFtcyA9IHRoaXMub3B0aW9ucy5wYXJhbXMgITtcbiAgICAgIE9iamVjdC5rZXlzKG5ld1BhcmFtcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgaWYgKG9sZFBhcmFtc1twcm9wXSA9PSBudWxsKSB7XG4gICAgICAgICAgb2xkUGFyYW1zW3Byb3BdID0gbmV3UGFyYW1zW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFZPSURfVkFMVUUgPSAndm9pZCc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9TVEFURV9WQUxVRSA9IG5ldyBTdGF0ZVZhbHVlKFZPSURfVkFMVUUpO1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZSB7XG4gIHB1YmxpYyBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcblxuICBwcml2YXRlIF90cmlnZ2Vyczoge1t0cmlnZ2VyTmFtZTogc3RyaW5nXTogQW5pbWF0aW9uVHJpZ2dlcn0gPSB7fTtcbiAgcHJpdmF0ZSBfcXVldWU6IFF1ZXVlSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuXG4gIHByaXZhdGUgX2VsZW1lbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPGFueSwgVHJpZ2dlckxpc3RlbmVyW10+KCk7XG5cbiAgcHJpdmF0ZSBfaG9zdENsYXNzTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBob3N0RWxlbWVudDogYW55LCBwcml2YXRlIF9lbmdpbmU6IFRyYW5zaXRpb25BbmltYXRpb25FbmdpbmUpIHtcbiAgICB0aGlzLl9ob3N0Q2xhc3NOYW1lID0gJ25nLXRucy0nICsgaWQ7XG4gICAgYWRkQ2xhc3MoaG9zdEVsZW1lbnQsIHRoaXMuX2hvc3RDbGFzc05hbWUpO1xuICB9XG5cbiAgbGlzdGVuKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCBwaGFzZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiBhbnkge1xuICAgIGlmICghdGhpcy5fdHJpZ2dlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGxpc3RlbiBvbiB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgZXZlbnQgXCIke1xuICAgICAgICAgIHBoYXNlfVwiIGJlY2F1c2UgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyIFwiJHtuYW1lfVwiIGRvZXNuXFwndCBleGlzdCFgKTtcbiAgICB9XG5cbiAgICBpZiAocGhhc2UgPT0gbnVsbCB8fCBwaGFzZS5sZW5ndGggPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gbGlzdGVuIG9uIHRoZSBhbmltYXRpb24gdHJpZ2dlciBcIiR7XG4gICAgICAgICAgbmFtZX1cIiBiZWNhdXNlIHRoZSBwcm92aWRlZCBldmVudCBpcyB1bmRlZmluZWQhYCk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1RyaWdnZXJFdmVudFZhbGlkKHBoYXNlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHRyaWdnZXIgZXZlbnQgXCIke3BoYXNlfVwiIGZvciB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgXCIke1xuICAgICAgICAgIG5hbWV9XCIgaXMgbm90IHN1cHBvcnRlZCFgKTtcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBnZXRPclNldEFzSW5NYXAodGhpcy5fZWxlbWVudExpc3RlbmVycywgZWxlbWVudCwgW10pO1xuICAgIGNvbnN0IGRhdGEgPSB7bmFtZSwgcGhhc2UsIGNhbGxiYWNrfTtcbiAgICBsaXN0ZW5lcnMucHVzaChkYXRhKTtcblxuICAgIGNvbnN0IHRyaWdnZXJzV2l0aFN0YXRlcyA9IGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LCBlbGVtZW50LCB7fSk7XG4gICAgaWYgKCF0cmlnZ2Vyc1dpdGhTdGF0ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FKTtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIE5HX1RSSUdHRVJfQ0xBU1NOQU1FICsgJy0nICsgbmFtZSk7XG4gICAgICB0cmlnZ2Vyc1dpdGhTdGF0ZXNbbmFtZV0gPSBERUZBVUxUX1NUQVRFX1ZBTFVFO1xuICAgIH1cblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAvLyB0aGUgZXZlbnQgbGlzdGVuZXIgaXMgcmVtb3ZlZCBBRlRFUiB0aGUgZmx1c2ggaGFzIG9jY3VycmVkIHN1Y2hcbiAgICAgIC8vIHRoYXQgbGVhdmUgYW5pbWF0aW9ucyBjYWxsYmFja3MgY2FuIGZpcmUgKG90aGVyd2lzZSBpZiB0aGUgbm9kZVxuICAgICAgLy8gaXMgcmVtb3ZlZCBpbiBiZXR3ZWVuIHRoZW4gdGhlIGxpc3RlbmVycyB3b3VsZCBiZSBkZXJlZ2lzdGVyZWQpXG4gICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoZGF0YSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX3RyaWdnZXJzW25hbWVdKSB7XG4gICAgICAgICAgZGVsZXRlIHRyaWdnZXJzV2l0aFN0YXRlc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWU6IHN0cmluZywgYXN0OiBBbmltYXRpb25UcmlnZ2VyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3RyaWdnZXJzW25hbWVdKSB7XG4gICAgICAvLyB0aHJvd1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90cmlnZ2Vyc1tuYW1lXSA9IGFzdDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldFRyaWdnZXIobmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX3RyaWdnZXJzW25hbWVdO1xuICAgIGlmICghdHJpZ2dlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIHRyaWdnZXIgXCIke25hbWV9XCIgaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWQhYCk7XG4gICAgfVxuICAgIHJldHVybiB0cmlnZ2VyO1xuICB9XG5cbiAgdHJpZ2dlcihlbGVtZW50OiBhbnksIHRyaWdnZXJOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnksIGRlZmF1bHRUb0ZhbGxiYWNrOiBib29sZWFuID0gdHJ1ZSk6XG4gICAgICBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHJpZ2dlciA9IHRoaXMuX2dldFRyaWdnZXIodHJpZ2dlck5hbWUpO1xuICAgIGNvbnN0IHBsYXllciA9IG5ldyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKHRoaXMuaWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcblxuICAgIGxldCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICBpZiAoIXRyaWdnZXJzV2l0aFN0YXRlcykge1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgTkdfVFJJR0dFUl9DTEFTU05BTUUgKyAnLScgKyB0cmlnZ2VyTmFtZSk7XG4gICAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LnNldChlbGVtZW50LCB0cmlnZ2Vyc1dpdGhTdGF0ZXMgPSB7fSk7XG4gICAgfVxuXG4gICAgbGV0IGZyb21TdGF0ZSA9IHRyaWdnZXJzV2l0aFN0YXRlc1t0cmlnZ2VyTmFtZV07XG4gICAgY29uc3QgdG9TdGF0ZSA9IG5ldyBTdGF0ZVZhbHVlKHZhbHVlLCB0aGlzLmlkKTtcblxuICAgIGNvbnN0IGlzT2JqID0gdmFsdWUgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJyk7XG4gICAgaWYgKCFpc09iaiAmJiBmcm9tU3RhdGUpIHtcbiAgICAgIHRvU3RhdGUuYWJzb3JiT3B0aW9ucyhmcm9tU3RhdGUub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdHJpZ2dlcnNXaXRoU3RhdGVzW3RyaWdnZXJOYW1lXSA9IHRvU3RhdGU7XG5cbiAgICBpZiAoIWZyb21TdGF0ZSkge1xuICAgICAgZnJvbVN0YXRlID0gREVGQVVMVF9TVEFURV9WQUxVRTtcbiAgICB9XG5cbiAgICBjb25zdCBpc1JlbW92YWwgPSB0b1N0YXRlLnZhbHVlID09PSBWT0lEX1ZBTFVFO1xuXG4gICAgLy8gbm9ybWFsbHkgdGhpcyBpc24ndCByZWFjaGVkIGJ5IGhlcmUsIGhvd2V2ZXIsIGlmIGFuIG9iamVjdCBleHByZXNzaW9uXG4gICAgLy8gaXMgcGFzc2VkIGluIHRoZW4gaXQgbWF5IGJlIGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuIENvbXBhcmluZyB0aGUgdmFsdWVcbiAgICAvLyBpcyBpbXBvcnRhbnQgc2luY2UgdGhhdCB3aWxsIHN0YXkgdGhlIHNhbWUgZGVzcGl0ZSB0aGVyZSBiZWluZyBhIG5ldyBvYmplY3QuXG4gICAgLy8gVGhlIHJlbW92YWwgYXJjIGhlcmUgaXMgc3BlY2lhbCBjYXNlZCBiZWNhdXNlIHRoZSBzYW1lIGVsZW1lbnQgaXMgdHJpZ2dlcmVkXG4gICAgLy8gdHdpY2UgaW4gdGhlIGV2ZW50IHRoYXQgaXQgY29udGFpbnMgYW5pbWF0aW9ucyBvbiB0aGUgb3V0ZXIvaW5uZXIgcG9ydGlvbnNcbiAgICAvLyBvZiB0aGUgaG9zdCBjb250YWluZXJcbiAgICBpZiAoIWlzUmVtb3ZhbCAmJiBmcm9tU3RhdGUudmFsdWUgPT09IHRvU3RhdGUudmFsdWUpIHtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBkZXNwaXRlIHRoZSB2YWx1ZSBub3QgY2hhbmdpbmcsIHNvbWUgaW5uZXIgcGFyYW1zXG4gICAgICAvLyBoYXZlIGNoYW5nZWQgd2hpY2ggbWVhbnMgdGhhdCB0aGUgYW5pbWF0aW9uIGZpbmFsIHN0eWxlcyBuZWVkIHRvIGJlIGFwcGxpZWRcbiAgICAgIGlmICghb2JqRXF1YWxzKGZyb21TdGF0ZS5wYXJhbXMsIHRvU3RhdGUucGFyYW1zKSkge1xuICAgICAgICBjb25zdCBlcnJvcnM6IGFueVtdID0gW107XG4gICAgICAgIGNvbnN0IGZyb21TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKGZyb21TdGF0ZS52YWx1ZSwgZnJvbVN0YXRlLnBhcmFtcywgZXJyb3JzKTtcbiAgICAgICAgY29uc3QgdG9TdHlsZXMgPSB0cmlnZ2VyLm1hdGNoU3R5bGVzKHRvU3RhdGUudmFsdWUsIHRvU3RhdGUucGFyYW1zLCBlcnJvcnMpO1xuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5yZXBvcnRFcnJvcihlcnJvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2VuZ2luZS5hZnRlckZsdXNoKCgpID0+IHtcbiAgICAgICAgICAgIGVyYXNlU3R5bGVzKGVsZW1lbnQsIGZyb21TdHlsZXMpO1xuICAgICAgICAgICAgc2V0U3R5bGVzKGVsZW1lbnQsIHRvU3R5bGVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXllcnNPbkVsZW1lbnQ6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9XG4gICAgICAgIGdldE9yU2V0QXNJbk1hcCh0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudCwgZWxlbWVudCwgW10pO1xuICAgIHBsYXllcnNPbkVsZW1lbnQuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgLy8gb25seSByZW1vdmUgdGhlIHBsYXllciBpZiBpdCBpcyBxdWV1ZWQgb24gdGhlIEVYQUNUIHNhbWUgdHJpZ2dlci9uYW1lc3BhY2VcbiAgICAgIC8vIHdlIG9ubHkgYWxzbyBkZWFsIHdpdGggcXVldWVkIHBsYXllcnMgaGVyZSBiZWNhdXNlIGlmIHRoZSBhbmltYXRpb24gaGFzXG4gICAgICAvLyBzdGFydGVkIHRoZW4gd2Ugd2FudCB0byBrZWVwIHRoZSBwbGF5ZXIgYWxpdmUgdW50aWwgdGhlIGZsdXNoIGhhcHBlbnNcbiAgICAgIC8vICh3aGljaCBpcyB3aGVyZSB0aGUgcHJldmlvdXNQbGF5ZXJzIGFyZSBwYXNzZWQgaW50byB0aGUgbmV3IHBhbHllcilcbiAgICAgIGlmIChwbGF5ZXIubmFtZXNwYWNlSWQgPT0gdGhpcy5pZCAmJiBwbGF5ZXIudHJpZ2dlck5hbWUgPT0gdHJpZ2dlck5hbWUgJiYgcGxheWVyLnF1ZXVlZCkge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHRyYW5zaXRpb24gPVxuICAgICAgICB0cmlnZ2VyLm1hdGNoVHJhbnNpdGlvbihmcm9tU3RhdGUudmFsdWUsIHRvU3RhdGUudmFsdWUsIGVsZW1lbnQsIHRvU3RhdGUucGFyYW1zKTtcbiAgICBsZXQgaXNGYWxsYmFja1RyYW5zaXRpb24gPSBmYWxzZTtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgIGlmICghZGVmYXVsdFRvRmFsbGJhY2spIHJldHVybjtcbiAgICAgIHRyYW5zaXRpb24gPSB0cmlnZ2VyLmZhbGxiYWNrVHJhbnNpdGlvbjtcbiAgICAgIGlzRmFsbGJhY2tUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbmdpbmUudG90YWxRdWV1ZWRQbGF5ZXJzKys7XG4gICAgdGhpcy5fcXVldWUucHVzaChcbiAgICAgICAge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCB0cmFuc2l0aW9uLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBsYXllciwgaXNGYWxsYmFja1RyYW5zaXRpb259KTtcblxuICAgIGlmICghaXNGYWxsYmFja1RyYW5zaXRpb24pIHtcbiAgICAgIGFkZENsYXNzKGVsZW1lbnQsIFFVRVVFRF9DTEFTU05BTUUpO1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4geyByZW1vdmVDbGFzcyhlbGVtZW50LCBRVUVVRURfQ0xBU1NOQU1FKTsgfSk7XG4gICAgfVxuXG4gICAgcGxheWVyLm9uRG9uZSgoKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnBsYXllcnMuaW5kZXhPZihwbGF5ZXIpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBsYXllcnMgPSB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAocGxheWVycykge1xuICAgICAgICBsZXQgaW5kZXggPSBwbGF5ZXJzLmluZGV4T2YocGxheWVyKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBwbGF5ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgcGxheWVyc09uRWxlbWVudC5wdXNoKHBsYXllcik7XG5cbiAgICByZXR1cm4gcGxheWVyO1xuICB9XG5cbiAgZGVyZWdpc3RlcihuYW1lOiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5fdHJpZ2dlcnNbbmFtZV07XG5cbiAgICB0aGlzLl9lbmdpbmUuc3RhdGVzQnlFbGVtZW50LmZvckVhY2goKHN0YXRlTWFwLCBlbGVtZW50KSA9PiB7IGRlbGV0ZSBzdGF0ZU1hcFtuYW1lXTsgfSk7XG5cbiAgICB0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVycywgZWxlbWVudCkgPT4ge1xuICAgICAgdGhpcy5fZWxlbWVudExpc3RlbmVycy5zZXQoXG4gICAgICAgICAgZWxlbWVudCwgbGlzdGVuZXJzLmZpbHRlcihlbnRyeSA9PiB7IHJldHVybiBlbnRyeS5uYW1lICE9IG5hbWU7IH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsZWFyRWxlbWVudENhY2hlKGVsZW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZGVsZXRlKGVsZW1lbnQpO1xuICAgIHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZGVsZXRlKGVsZW1lbnQpO1xuICAgIGNvbnN0IGVsZW1lbnRQbGF5ZXJzID0gdGhpcy5fZW5naW5lLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChlbGVtZW50UGxheWVycykge1xuICAgICAgZWxlbWVudFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLl9lbmdpbmUucGxheWVyc0J5RWxlbWVudC5kZWxldGUoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnMocm9vdEVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9lbmdpbmUuZHJpdmVyLnF1ZXJ5KHJvb3RFbGVtZW50LCBOR19UUklHR0VSX1NFTEVDVE9SLCB0cnVlKTtcblxuICAgIC8vIGVtdWxhdGUgYSBsZWF2ZSBhbmltYXRpb24gZm9yIGFsbCBpbm5lciBub2RlcyB3aXRoaW4gdGhpcyBub2RlLlxuICAgIC8vIElmIHRoZXJlIGFyZSBubyBhbmltYXRpb25zIGZvdW5kIGZvciBhbnkgb2YgdGhlIG5vZGVzIHRoZW4gY2xlYXIgdGhlIGNhY2hlXG4gICAgLy8gZm9yIHRoZSBlbGVtZW50LlxuICAgIGVsZW1lbnRzLmZvckVhY2goZWxtID0+IHtcbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBhbiBpbm5lciByZW1vdmUoKSBvcGVyYXRpb24gaGFzIGFscmVhZHkga2lja2VkIG9mZlxuICAgICAgLy8gdGhlIGFuaW1hdGlvbiBvbiB0aGlzIGVsZW1lbnQuLi5cbiAgICAgIGlmIChlbG1bUkVNT1ZBTF9GTEFHXSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBuYW1lc3BhY2VzID0gdGhpcy5fZW5naW5lLmZldGNoTmFtZXNwYWNlc0J5RWxlbWVudChlbG0pO1xuICAgICAgaWYgKG5hbWVzcGFjZXMuc2l6ZSkge1xuICAgICAgICBuYW1lc3BhY2VzLmZvckVhY2gobnMgPT4gbnMudHJpZ2dlckxlYXZlQW5pbWF0aW9uKGVsbSwgY29udGV4dCwgZmFsc2UsIHRydWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xlYXJFbGVtZW50Q2FjaGUoZWxtKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBjaGlsZCBlbGVtZW50cyB3ZXJlIHJlbW92ZWQgYWxvbmcgd2l0aCB0aGUgcGFyZW50LCB0aGVpciBhbmltYXRpb25zIG1pZ2h0IG5vdFxuICAgIC8vIGhhdmUgY29tcGxldGVkLiBDbGVhciBhbGwgdGhlIGVsZW1lbnRzIGZyb20gdGhlIGNhY2hlIHNvIHdlIGRvbid0IGVuZCB1cCB3aXRoIGEgbWVtb3J5IGxlYWsuXG4gICAgdGhpcy5fZW5naW5lLmFmdGVyRmx1c2hBbmltYXRpb25zRG9uZShcbiAgICAgICAgKCkgPT4gZWxlbWVudHMuZm9yRWFjaChlbG0gPT4gdGhpcy5jbGVhckVsZW1lbnRDYWNoZShlbG0pKSk7XG4gIH1cblxuICB0cmlnZ2VyTGVhdmVBbmltYXRpb24oXG4gICAgICBlbGVtZW50OiBhbnksIGNvbnRleHQ6IGFueSwgZGVzdHJveUFmdGVyQ29tcGxldGU/OiBib29sZWFuLFxuICAgICAgZGVmYXVsdFRvRmFsbGJhY2s/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdHJpZ2dlclN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICh0cmlnZ2VyU3RhdGVzKSB7XG4gICAgICBjb25zdCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKHRyaWdnZXJTdGF0ZXMpLmZvckVhY2godHJpZ2dlck5hbWUgPT4ge1xuICAgICAgICAvLyB0aGlzIGNoZWNrIGlzIGhlcmUgaW4gdGhlIGV2ZW50IHRoYXQgYW4gZWxlbWVudCBpcyByZW1vdmVkXG4gICAgICAgIC8vIHR3aWNlIChib3RoIG9uIHRoZSBob3N0IGxldmVsIGFuZCB0aGUgY29tcG9uZW50IGxldmVsKVxuICAgICAgICBpZiAodGhpcy5fdHJpZ2dlcnNbdHJpZ2dlck5hbWVdKSB7XG4gICAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy50cmlnZ2VyKGVsZW1lbnQsIHRyaWdnZXJOYW1lLCBWT0lEX1ZBTFVFLCBkZWZhdWx0VG9GYWxsYmFjayk7XG4gICAgICAgICAgaWYgKHBsYXllcikge1xuICAgICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX2VuZ2luZS5tYXJrRWxlbWVudEFzUmVtb3ZlZCh0aGlzLmlkLCBlbGVtZW50LCB0cnVlLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKGRlc3Ryb3lBZnRlckNvbXBsZXRlKSB7XG4gICAgICAgICAgb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzKS5vbkRvbmUoKCkgPT4gdGhpcy5fZW5naW5lLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcmVwYXJlTGVhdmVBbmltYXRpb25MaXN0ZW5lcnMoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fZWxlbWVudExpc3RlbmVycy5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgY29uc3QgdmlzaXRlZFRyaWdnZXJzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gbGlzdGVuZXIubmFtZTtcbiAgICAgICAgaWYgKHZpc2l0ZWRUcmlnZ2Vycy5oYXModHJpZ2dlck5hbWUpKSByZXR1cm47XG4gICAgICAgIHZpc2l0ZWRUcmlnZ2Vycy5hZGQodHJpZ2dlck5hbWUpO1xuXG4gICAgICAgIGNvbnN0IHRyaWdnZXIgPSB0aGlzLl90cmlnZ2Vyc1t0cmlnZ2VyTmFtZV07XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb24gPSB0cmlnZ2VyLmZhbGxiYWNrVHJhbnNpdGlvbjtcbiAgICAgICAgY29uc3QgZWxlbWVudFN0YXRlcyA9IHRoaXMuX2VuZ2luZS5zdGF0ZXNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgIGNvbnN0IGZyb21TdGF0ZSA9IGVsZW1lbnRTdGF0ZXNbdHJpZ2dlck5hbWVdIHx8IERFRkFVTFRfU1RBVEVfVkFMVUU7XG4gICAgICAgIGNvbnN0IHRvU3RhdGUgPSBuZXcgU3RhdGVWYWx1ZShWT0lEX1ZBTFVFKTtcbiAgICAgICAgY29uc3QgcGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIodGhpcy5pZCwgdHJpZ2dlck5hbWUsIGVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuX2VuZ2luZS50b3RhbFF1ZXVlZFBsYXllcnMrKztcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICB0cmlnZ2VyTmFtZSxcbiAgICAgICAgICB0cmFuc2l0aW9uLFxuICAgICAgICAgIGZyb21TdGF0ZSxcbiAgICAgICAgICB0b1N0YXRlLFxuICAgICAgICAgIHBsYXllcixcbiAgICAgICAgICBpc0ZhbGxiYWNrVHJhbnNpdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZU5vZGUoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9lbmdpbmU7XG5cbiAgICBpZiAoZWxlbWVudC5jaGlsZEVsZW1lbnRDb3VudCkge1xuICAgICAgdGhpcy5fc2lnbmFsUmVtb3ZhbEZvcklubmVyVHJpZ2dlcnMoZWxlbWVudCwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBtZWFucyB0aGF0IGEgKiA9PiBWT0lEIGFuaW1hdGlvbiB3YXMgZGV0ZWN0ZWQgYW5kIGtpY2tlZCBvZmZcbiAgICBpZiAodGhpcy50cmlnZ2VyTGVhdmVBbmltYXRpb24oZWxlbWVudCwgY29udGV4dCwgdHJ1ZSkpIHJldHVybjtcblxuICAgIC8vIGZpbmQgdGhlIHBsYXllciB0aGF0IGlzIGFuaW1hdGluZyBhbmQgbWFrZSBzdXJlIHRoYXQgdGhlXG4gICAgLy8gcmVtb3ZhbCBpcyBkZWxheWVkIHVudGlsIHRoYXQgcGxheWVyIGhhcyBjb21wbGV0ZWRcbiAgICBsZXQgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gZmFsc2U7XG4gICAgaWYgKGVuZ2luZS50b3RhbEFuaW1hdGlvbnMpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXJzID1cbiAgICAgICAgICBlbmdpbmUucGxheWVycy5sZW5ndGggPyBlbmdpbmUucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuZ2V0KGVsZW1lbnQpIDogW107XG5cbiAgICAgIC8vIHdoZW4gdGhpcyBgaWYgc3RhdGVtZW50YCBkb2VzIG5vdCBjb250aW51ZSBmb3J3YXJkIGl0IG1lYW5zIHRoYXRcbiAgICAgIC8vIGEgcHJldmlvdXMgYW5pbWF0aW9uIHF1ZXJ5IGhhcyBzZWxlY3RlZCB0aGUgY3VycmVudCBlbGVtZW50IGFuZFxuICAgICAgLy8gaXMgYW5pbWF0aW5nIGl0LiBJbiB0aGlzIHNpdHVhdGlvbiB3YW50IHRvIGNvbnRpbnVlIGZvcndhcmRzIGFuZFxuICAgICAgLy8gYWxsb3cgdGhlIGVsZW1lbnQgdG8gYmUgcXVldWVkIHVwIGZvciBhbmltYXRpb24gbGF0ZXIuXG4gICAgICBpZiAoY3VycmVudFBsYXllcnMgJiYgY3VycmVudFBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRhaW5zUG90ZW50aWFsUGFyZW50VHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcGFyZW50ID0gZWxlbWVudDtcbiAgICAgICAgd2hpbGUgKHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgY29uc3QgdHJpZ2dlcnMgPSBlbmdpbmUuc3RhdGVzQnlFbGVtZW50LmdldChwYXJlbnQpO1xuICAgICAgICAgIGlmICh0cmlnZ2Vycykge1xuICAgICAgICAgICAgY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgc3RhZ2Ugd2Uga25vdyB0aGF0IHRoZSBlbGVtZW50IHdpbGwgZWl0aGVyIGdldCByZW1vdmVkXG4gICAgLy8gZHVyaW5nIGZsdXNoIG9yIHdpbGwgYmUgcGlja2VkIHVwIGJ5IGEgcGFyZW50IHF1ZXJ5LiBFaXRoZXIgd2F5XG4gICAgLy8gd2UgbmVlZCB0byBmaXJlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoaXMgZWxlbWVudCB3aGVuIGl0IERPRVMgZ2V0XG4gICAgLy8gcmVtb3ZlZCAob25jZSB0aGUgcXVlcnkgcGFyZW50IGFuaW1hdGlvbiBpcyBkb25lIG9yIGFmdGVyIGZsdXNoKVxuICAgIHRoaXMucHJlcGFyZUxlYXZlQW5pbWF0aW9uTGlzdGVuZXJzKGVsZW1lbnQpO1xuXG4gICAgLy8gd2hldGhlciBvciBub3QgYSBwYXJlbnQgaGFzIGFuIGFuaW1hdGlvbiB3ZSBuZWVkIHRvIGRlbGF5IHRoZSBkZWZlcnJhbCBvZiB0aGUgbGVhdmVcbiAgICAvLyBvcGVyYXRpb24gdW50aWwgd2UgaGF2ZSBtb3JlIGluZm9ybWF0aW9uICh3aGljaCB3ZSBkbyBhZnRlciBmbHVzaCgpIGhhcyBiZWVuIGNhbGxlZClcbiAgICBpZiAoY29udGFpbnNQb3RlbnRpYWxQYXJlbnRUcmFuc2l0aW9uKSB7XG4gICAgICBlbmdpbmUubWFya0VsZW1lbnRBc1JlbW92ZWQodGhpcy5pZCwgZWxlbWVudCwgZmFsc2UsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZW1vdmFsRmxhZyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXTtcbiAgICAgIGlmICghcmVtb3ZhbEZsYWcgfHwgcmVtb3ZhbEZsYWcgPT09IE5VTExfUkVNT1ZBTF9TVEFURSkge1xuICAgICAgICAvLyB3ZSBkbyB0aGlzIGFmdGVyIHRoZSBmbHVzaCBoYXMgb2NjdXJyZWQgc3VjaFxuICAgICAgICAvLyB0aGF0IHRoZSBjYWxsYmFja3MgY2FuIGJlIGZpcmVkXG4gICAgICAgIGVuZ2luZS5hZnRlckZsdXNoKCgpID0+IHRoaXMuY2xlYXJFbGVtZW50Q2FjaGUoZWxlbWVudCkpO1xuICAgICAgICBlbmdpbmUuZGVzdHJveUlubmVyQW5pbWF0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgZW5naW5lLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpbnNlcnROb2RlKGVsZW1lbnQ6IGFueSwgcGFyZW50OiBhbnkpOiB2b2lkIHsgYWRkQ2xhc3MoZWxlbWVudCwgdGhpcy5faG9zdENsYXNzTmFtZSk7IH1cblxuICBkcmFpblF1ZXVlZFRyYW5zaXRpb25zKG1pY3JvdGFza0lkOiBudW1iZXIpOiBRdWV1ZUluc3RydWN0aW9uW10ge1xuICAgIGNvbnN0IGluc3RydWN0aW9uczogUXVldWVJbnN0cnVjdGlvbltdID0gW107XG4gICAgdGhpcy5fcXVldWUuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICBjb25zdCBwbGF5ZXIgPSBlbnRyeS5wbGF5ZXI7XG4gICAgICBpZiAocGxheWVyLmRlc3Ryb3llZCkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBlbGVtZW50ID0gZW50cnkuZWxlbWVudDtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2VsZW1lbnRMaXN0ZW5lcnMuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXI6IFRyaWdnZXJMaXN0ZW5lcikgPT4ge1xuICAgICAgICAgIGlmIChsaXN0ZW5lci5uYW1lID09IGVudHJ5LnRyaWdnZXJOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlRXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICAgICAgICAgICAgZWxlbWVudCwgZW50cnkudHJpZ2dlck5hbWUsIGVudHJ5LmZyb21TdGF0ZS52YWx1ZSwgZW50cnkudG9TdGF0ZS52YWx1ZSk7XG4gICAgICAgICAgICAoYmFzZUV2ZW50IGFzIGFueSlbJ19kYXRhJ10gPSBtaWNyb3Rhc2tJZDtcbiAgICAgICAgICAgIGxpc3Rlbk9uUGxheWVyKGVudHJ5LnBsYXllciwgbGlzdGVuZXIucGhhc2UsIGJhc2VFdmVudCwgbGlzdGVuZXIuY2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwbGF5ZXIubWFya2VkRm9yRGVzdHJveSkge1xuICAgICAgICB0aGlzLl9lbmdpbmUuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICAgICAgLy8gbm93IHdlIGNhbiBkZXN0cm95IHRoZSBlbGVtZW50IHByb3Blcmx5IHNpbmNlIHRoZSBldmVudCBsaXN0ZW5lcnMgaGF2ZVxuICAgICAgICAgIC8vIGJlZW4gYm91bmQgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goZW50cnkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fcXVldWUgPSBbXTtcblxuICAgIHJldHVybiBpbnN0cnVjdGlvbnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgLy8gaWYgZGVwQ291bnQgPT0gMCB0aGVtIG1vdmUgdG8gZnJvbnRcbiAgICAgIC8vIG90aGVyd2lzZSBpZiBhIGNvbnRhaW5zIGIgdGhlbiBtb3ZlIGJhY2tcbiAgICAgIGNvbnN0IGQwID0gYS50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGNvbnN0IGQxID0gYi50cmFuc2l0aW9uLmFzdC5kZXBDb3VudDtcbiAgICAgIGlmIChkMCA9PSAwIHx8IGQxID09IDApIHtcbiAgICAgICAgcmV0dXJuIGQwIC0gZDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZW5naW5lLmRyaXZlci5jb250YWluc0VsZW1lbnQoYS5lbGVtZW50LCBiLmVsZW1lbnQpID8gMSA6IC0xO1xuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveShjb250ZXh0OiBhbnkpIHtcbiAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwID0+IHAuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9zaWduYWxSZW1vdmFsRm9ySW5uZXJUcmlnZ2Vycyh0aGlzLmhvc3RFbGVtZW50LCBjb250ZXh0KTtcbiAgfVxuXG4gIGVsZW1lbnRDb250YWluc0RhdGEoZWxlbWVudDogYW55KTogYm9vbGVhbiB7XG4gICAgbGV0IGNvbnRhaW5zRGF0YSA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9lbGVtZW50TGlzdGVuZXJzLmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBjb250YWluc0RhdGEgPVxuICAgICAgICAodGhpcy5fcXVldWUuZmluZChlbnRyeSA9PiBlbnRyeS5lbGVtZW50ID09PSBlbGVtZW50KSA/IHRydWUgOiBmYWxzZSkgfHwgY29udGFpbnNEYXRhO1xuICAgIHJldHVybiBjb250YWluc0RhdGE7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWV1ZWRUcmFuc2l0aW9uIHtcbiAgZWxlbWVudDogYW55O1xuICBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uO1xuICBwbGF5ZXI6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uQW5pbWF0aW9uRW5naW5lIHtcbiAgcHVibGljIHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICBwdWJsaWMgbmV3SG9zdEVsZW1lbnRzID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBwbGF5ZXJzQnlFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHBsYXllcnNCeVF1ZXJpZWRFbGVtZW50ID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgcHVibGljIHN0YXRlc0J5RWxlbWVudCA9IG5ldyBNYXA8YW55LCB7W3RyaWdnZXJOYW1lOiBzdHJpbmddOiBTdGF0ZVZhbHVlfT4oKTtcbiAgcHVibGljIGRpc2FibGVkTm9kZXMgPSBuZXcgU2V0PGFueT4oKTtcblxuICBwdWJsaWMgdG90YWxBbmltYXRpb25zID0gMDtcbiAgcHVibGljIHRvdGFsUXVldWVkUGxheWVycyA9IDA7XG5cbiAgcHJpdmF0ZSBfbmFtZXNwYWNlTG9va3VwOiB7W2lkOiBzdHJpbmddOiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlfSA9IHt9O1xuICBwcml2YXRlIF9uYW1lc3BhY2VMaXN0OiBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmx1c2hGbnM6ICgoKSA9PiBhbnkpW10gPSBbXTtcbiAgcHJpdmF0ZSBfd2hlblF1aWV0Rm5zOiAoKCkgPT4gYW55KVtdID0gW107XG5cbiAgcHVibGljIG5hbWVzcGFjZXNCeUhvc3RFbGVtZW50ID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblRyYW5zaXRpb25OYW1lc3BhY2U+KCk7XG4gIHB1YmxpYyBjb2xsZWN0ZWRFbnRlckVsZW1lbnRzOiBhbnlbXSA9IFtdO1xuICBwdWJsaWMgY29sbGVjdGVkTGVhdmVFbGVtZW50czogYW55W10gPSBbXTtcblxuICAvLyB0aGlzIG1ldGhvZCBpcyBkZXNpZ25lZCB0byBiZSBvdmVycmlkZGVuIGJ5IHRoZSBjb2RlIHRoYXQgdXNlcyB0aGlzIGVuZ2luZVxuICBwdWJsaWMgb25SZW1vdmFsQ29tcGxldGUgPSAoZWxlbWVudDogYW55LCBjb250ZXh0OiBhbnkpID0+IHt9O1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uUmVtb3ZhbENvbXBsZXRlKGVsZW1lbnQ6IGFueSwgY29udGV4dDogYW55KSB7IHRoaXMub25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgY29udGV4dCk7IH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBib2R5Tm9kZTogYW55LCBwdWJsaWMgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsXG4gICAgICBwcml2YXRlIF9ub3JtYWxpemVyOiBBbmltYXRpb25TdHlsZU5vcm1hbGl6ZXIpIHt9XG5cbiAgZ2V0IHF1ZXVlZFBsYXllcnMoKTogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBjb25zdCBwbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LmZvckVhY2gobnMgPT4ge1xuICAgICAgbnMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGlmIChwbGF5ZXIucXVldWVkKSB7XG4gICAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBwbGF5ZXJzO1xuICB9XG5cbiAgY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGhvc3RFbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBucyA9IG5ldyBBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlKG5hbWVzcGFjZUlkLCBob3N0RWxlbWVudCwgdGhpcyk7XG4gICAgaWYgKGhvc3RFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zLCBob3N0RWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRlZmVyIHRoaXMgbGF0ZXIgdW50aWwgZmx1c2ggZHVyaW5nIHdoZW4gdGhlIGhvc3QgZWxlbWVudCBoYXNcbiAgICAgIC8vIGJlZW4gaW5zZXJ0ZWQgc28gdGhhdCB3ZSBrbm93IGV4YWN0bHkgd2hlcmUgdG8gcGxhY2UgaXQgaW5cbiAgICAgIC8vIHRoZSBuYW1lc3BhY2UgbGlzdFxuICAgICAgdGhpcy5uZXdIb3N0RWxlbWVudHMuc2V0KGhvc3RFbGVtZW50LCBucyk7XG5cbiAgICAgIC8vIGdpdmVuIHRoYXQgdGhpcyBob3N0IGVsZW1lbnQgaXMgYXBhcnQgb2YgdGhlIGFuaW1hdGlvbiBjb2RlLCBpdFxuICAgICAgLy8gbWF5IG9yIG1heSBub3QgYmUgaW5zZXJ0ZWQgYnkgYSBwYXJlbnQgbm9kZSB0aGF0IGlzIGFuIG9mIGFuXG4gICAgICAvLyBhbmltYXRpb24gcmVuZGVyZXIgdHlwZS4gSWYgdGhpcyBoYXBwZW5zIHRoZW4gd2UgY2FuIHN0aWxsIGhhdmVcbiAgICAgIC8vIGFjY2VzcyB0byB0aGlzIGl0ZW0gd2hlbiB3ZSBxdWVyeSBmb3IgOmVudGVyIG5vZGVzLiBJZiB0aGUgcGFyZW50XG4gICAgICAvLyBpcyBhIHJlbmRlcmVyIHRoZW4gdGhlIHNldCBkYXRhLXN0cnVjdHVyZSB3aWxsIG5vcm1hbGl6ZSB0aGUgZW50cnlcbiAgICAgIHRoaXMuY29sbGVjdEVudGVyRWxlbWVudChob3N0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9uYW1lc3BhY2VMb29rdXBbbmFtZXNwYWNlSWRdID0gbnM7XG4gIH1cblxuICBwcml2YXRlIF9iYWxhbmNlTmFtZXNwYWNlTGlzdChuczogQW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZSwgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGxpbWl0ID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5sZW5ndGggLSAxO1xuICAgIGlmIChsaW1pdCA+PSAwKSB7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgIGZvciAobGV0IGkgPSBsaW1pdDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgbmV4dE5hbWVzcGFjZSA9IHRoaXMuX25hbWVzcGFjZUxpc3RbaV07XG4gICAgICAgIGlmICh0aGlzLmRyaXZlci5jb250YWluc0VsZW1lbnQobmV4dE5hbWVzcGFjZS5ob3N0RWxlbWVudCwgaG9zdEVsZW1lbnQpKSB7XG4gICAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoaSArIDEsIDAsIG5zKTtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgdGhpcy5fbmFtZXNwYWNlTGlzdC5zcGxpY2UoMCwgMCwgbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uYW1lc3BhY2VMaXN0LnB1c2gobnMpO1xuICAgIH1cblxuICAgIHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuc2V0KGhvc3RFbGVtZW50LCBucyk7XG4gICAgcmV0dXJuIG5zO1xuICB9XG5cbiAgcmVnaXN0ZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgaG9zdEVsZW1lbnQ6IGFueSkge1xuICAgIGxldCBucyA9IHRoaXMuX25hbWVzcGFjZUxvb2t1cFtuYW1lc3BhY2VJZF07XG4gICAgaWYgKCFucykge1xuICAgICAgbnMgPSB0aGlzLmNyZWF0ZU5hbWVzcGFjZShuYW1lc3BhY2VJZCwgaG9zdEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gbnM7XG4gIH1cblxuICByZWdpc3RlclRyaWdnZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCB0cmlnZ2VyOiBBbmltYXRpb25UcmlnZ2VyKSB7XG4gICAgbGV0IG5zID0gdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICBpZiAobnMgJiYgbnMucmVnaXN0ZXIobmFtZSwgdHJpZ2dlcikpIHtcbiAgICAgIHRoaXMudG90YWxBbmltYXRpb25zKys7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveShuYW1lc3BhY2VJZDogc3RyaW5nLCBjb250ZXh0OiBhbnkpIHtcbiAgICBpZiAoIW5hbWVzcGFjZUlkKSByZXR1cm47XG5cbiAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcblxuICAgIHRoaXMuYWZ0ZXJGbHVzaCgoKSA9PiB7XG4gICAgICB0aGlzLm5hbWVzcGFjZXNCeUhvc3RFbGVtZW50LmRlbGV0ZShucy5ob3N0RWxlbWVudCk7XG4gICAgICBkZWxldGUgdGhpcy5fbmFtZXNwYWNlTG9va3VwW25hbWVzcGFjZUlkXTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5pbmRleE9mKG5zKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHRoaXMuX25hbWVzcGFjZUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWZ0ZXJGbHVzaEFuaW1hdGlvbnNEb25lKCgpID0+IG5zLmRlc3Ryb3koY29udGV4dCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmV0Y2hOYW1lc3BhY2UoaWQ6IHN0cmluZykgeyByZXR1cm4gdGhpcy5fbmFtZXNwYWNlTG9va3VwW2lkXTsgfVxuXG4gIGZldGNoTmFtZXNwYWNlc0J5RWxlbWVudChlbGVtZW50OiBhbnkpOiBTZXQ8QW5pbWF0aW9uVHJhbnNpdGlvbk5hbWVzcGFjZT4ge1xuICAgIC8vIG5vcm1hbGx5IHRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSBuYW1lc3BhY2UgcGVyIGVsZW1lbnQsIGhvd2V2ZXJcbiAgICAvLyBpZiBAdHJpZ2dlcnMgYXJlIHBsYWNlZCBvbiBib3RoIHRoZSBjb21wb25lbnQgZWxlbWVudCBhbmQgdGhlblxuICAgIC8vIGl0cyBob3N0IGVsZW1lbnQgKHdpdGhpbiB0aGUgY29tcG9uZW50IGNvZGUpIHRoZW4gdGhlcmUgd2lsbCBiZVxuICAgIC8vIHR3byBuYW1lc3BhY2VzIHJldHVybmVkLiBXZSB1c2UgYSBzZXQgaGVyZSB0byBzaW1wbHkgdGhlIGRlZHVwZVxuICAgIC8vIG9mIG5hbWVzcGFjZXMgaW5jYXNlIHRoZXJlIGFyZSBtdWx0aXBsZSB0cmlnZ2VycyBib3RoIHRoZSBlbG0gYW5kIGhvc3RcbiAgICBjb25zdCBuYW1lc3BhY2VzID0gbmV3IFNldDxBbmltYXRpb25UcmFuc2l0aW9uTmFtZXNwYWNlPigpO1xuICAgIGNvbnN0IGVsZW1lbnRTdGF0ZXMgPSB0aGlzLnN0YXRlc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRTdGF0ZXMpIHtcbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhlbGVtZW50U3RhdGVzKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuc0lkID0gZWxlbWVudFN0YXRlc1trZXlzW2ldXS5uYW1lc3BhY2VJZDtcbiAgICAgICAgaWYgKG5zSWQpIHtcbiAgICAgICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5zSWQpO1xuICAgICAgICAgIGlmIChucykge1xuICAgICAgICAgICAgbmFtZXNwYWNlcy5hZGQobnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmFtZXNwYWNlcztcbiAgfVxuXG4gIHRyaWdnZXIobmFtZXNwYWNlSWQ6IHN0cmluZywgZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoaXNFbGVtZW50Tm9kZShlbGVtZW50KSkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCk7XG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbnMudHJpZ2dlcihlbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpbnNlcnROb2RlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyZW50OiBhbnksIGluc2VydEJlZm9yZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghaXNFbGVtZW50Tm9kZShlbGVtZW50KSkgcmV0dXJuO1xuXG4gICAgLy8gc3BlY2lhbCBjYXNlIGZvciB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBhbmQgcmVpbnNlcnRlZCAobW92ZSBvcGVyYXRpb24pXG4gICAgLy8gd2hlbiB0aGlzIG9jY3VycyB3ZSBkbyBub3Qgd2FudCB0byB1c2UgdGhlIGVsZW1lbnQgZm9yIGRlbGV0aW9uIGxhdGVyXG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSB7XG4gICAgICBkZXRhaWxzLnNldEZvclJlbW92YWwgPSBmYWxzZTtcbiAgICAgIGRldGFpbHMuc2V0Rm9yTW92ZSA9IHRydWU7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuY29sbGVjdGVkTGVhdmVFbGVtZW50cy5pbmRleE9mKGVsZW1lbnQpO1xuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaW4gdGhlIGV2ZW50IHRoYXQgdGhlIG5hbWVzcGFjZUlkIGlzIGJsYW5rIHRoZW4gdGhlIGNhbGxlclxuICAgIC8vIGNvZGUgZG9lcyBub3QgY29udGFpbiBhbnkgYW5pbWF0aW9uIGNvZGUgaW4gaXQsIGJ1dCBpdCBpc1xuICAgIC8vIGp1c3QgYmVpbmcgY2FsbGVkIHNvIHRoYXQgdGhlIG5vZGUgaXMgbWFya2VkIGFzIGJlaW5nIGluc2VydGVkXG4gICAgaWYgKG5hbWVzcGFjZUlkKSB7XG4gICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKG5hbWVzcGFjZUlkKTtcbiAgICAgIC8vIFRoaXMgaWYtc3RhdGVtZW50IGlzIGEgd29ya2Fyb3VuZCBmb3Igcm91dGVyIGlzc3VlICMyMTk0Ny5cbiAgICAgIC8vIFRoZSByb3V0ZXIgc29tZXRpbWVzIGhpdHMgYSByYWNlIGNvbmRpdGlvbiB3aGVyZSB3aGlsZSBhIHJvdXRlXG4gICAgICAvLyBpcyBiZWluZyBpbnN0YW50aWF0ZWQgYSBuZXcgbmF2aWdhdGlvbiBhcnJpdmVzLCB0cmlnZ2VyaW5nIGxlYXZlXG4gICAgICAvLyBhbmltYXRpb24gb2YgRE9NIHRoYXQgaGFzIG5vdCBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCB1bnRpbCB0aGlzXG4gICAgICAvLyBpcyByZXNvbHZlZCwgd2UgbmVlZCB0byBoYW5kbGUgdGhlIHNjZW5hcmlvIHdoZW4gRE9NIGlzIG5vdCBpbiBhXG4gICAgICAvLyBjb25zaXN0ZW50IHN0YXRlIGR1cmluZyB0aGUgYW5pbWF0aW9uLlxuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLmluc2VydE5vZGUoZWxlbWVudCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBvbmx5ICpkaXJlY3RpdmVzIGFuZCBob3N0IGVsZW1lbnRzIGFyZSBpbnNlcnRlZCBiZWZvcmVcbiAgICBpZiAoaW5zZXJ0QmVmb3JlKSB7XG4gICAgICB0aGlzLmNvbGxlY3RFbnRlckVsZW1lbnQoZWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgY29sbGVjdEVudGVyRWxlbWVudChlbGVtZW50OiBhbnkpIHsgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLnB1c2goZWxlbWVudCk7IH1cblxuICBtYXJrRWxlbWVudEFzRGlzYWJsZWQoZWxlbWVudDogYW55LCB2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgaWYgKCF0aGlzLmRpc2FibGVkTm9kZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5hZGQoZWxlbWVudCk7XG4gICAgICAgIGFkZENsYXNzKGVsZW1lbnQsIERJU0FCTEVEX0NMQVNTTkFNRSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmRpc2FibGVkTm9kZXMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICB0aGlzLmRpc2FibGVkTm9kZXMuZGVsZXRlKGVsZW1lbnQpO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgRElTQUJMRURfQ0xBU1NOQU1FKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVOb2RlKG5hbWVzcGFjZUlkOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgaXNIb3N0RWxlbWVudDogYm9vbGVhbiwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIGNvbnN0IG5zID0gbmFtZXNwYWNlSWQgPyB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkgOiBudWxsO1xuICAgICAgaWYgKG5zKSB7XG4gICAgICAgIG5zLnJlbW92ZU5vZGUoZWxlbWVudCwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hcmtFbGVtZW50QXNSZW1vdmVkKG5hbWVzcGFjZUlkLCBlbGVtZW50LCBmYWxzZSwgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0hvc3RFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGhvc3ROUyA9IHRoaXMubmFtZXNwYWNlc0J5SG9zdEVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgICBpZiAoaG9zdE5TICYmIGhvc3ROUy5pZCAhPT0gbmFtZXNwYWNlSWQpIHtcbiAgICAgICAgICBob3N0TlMucmVtb3ZlTm9kZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vblJlbW92YWxDb21wbGV0ZShlbGVtZW50LCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBtYXJrRWxlbWVudEFzUmVtb3ZlZChuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIGhhc0FuaW1hdGlvbj86IGJvb2xlYW4sIGNvbnRleHQ/OiBhbnkpIHtcbiAgICB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICBlbGVtZW50W1JFTU9WQUxfRkxBR10gPSB7XG4gICAgICBuYW1lc3BhY2VJZCxcbiAgICAgIHNldEZvclJlbW92YWw6IGNvbnRleHQsIGhhc0FuaW1hdGlvbixcbiAgICAgIHJlbW92ZWRCZWZvcmVRdWVyaWVkOiBmYWxzZVxuICAgIH07XG4gIH1cblxuICBsaXN0ZW4oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgcGhhc2U6IHN0cmluZyxcbiAgICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbik6ICgpID0+IGFueSB7XG4gICAgaWYgKGlzRWxlbWVudE5vZGUoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkubGlzdGVuKGVsZW1lbnQsIG5hbWUsIHBoYXNlLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7fTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkSW5zdHJ1Y3Rpb24oXG4gICAgICBlbnRyeTogUXVldWVJbnN0cnVjdGlvbiwgc3ViVGltZWxpbmVzOiBFbGVtZW50SW5zdHJ1Y3Rpb25NYXAsIGVudGVyQ2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgICBsZWF2ZUNsYXNzTmFtZTogc3RyaW5nLCBza2lwQnVpbGRBc3Q/OiBib29sZWFuKSB7XG4gICAgcmV0dXJuIGVudHJ5LnRyYW5zaXRpb24uYnVpbGQoXG4gICAgICAgIHRoaXMuZHJpdmVyLCBlbnRyeS5lbGVtZW50LCBlbnRyeS5mcm9tU3RhdGUudmFsdWUsIGVudHJ5LnRvU3RhdGUudmFsdWUsIGVudGVyQ2xhc3NOYW1lLFxuICAgICAgICBsZWF2ZUNsYXNzTmFtZSwgZW50cnkuZnJvbVN0YXRlLm9wdGlvbnMsIGVudHJ5LnRvU3RhdGUub3B0aW9ucywgc3ViVGltZWxpbmVzLCBza2lwQnVpbGRBc3QpO1xuICB9XG5cbiAgZGVzdHJveUlubmVyQW5pbWF0aW9ucyhjb250YWluZXJFbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgZWxlbWVudHMgPSB0aGlzLmRyaXZlci5xdWVyeShjb250YWluZXJFbGVtZW50LCBOR19UUklHR0VSX1NFTEVDVE9SLCB0cnVlKTtcbiAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gdGhpcy5kZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudCkpO1xuXG4gICAgaWYgKHRoaXMucGxheWVyc0J5UXVlcmllZEVsZW1lbnQuc2l6ZSA9PSAwKSByZXR1cm47XG5cbiAgICBlbGVtZW50cyA9IHRoaXMuZHJpdmVyLnF1ZXJ5KGNvbnRhaW5lckVsZW1lbnQsIE5HX0FOSU1BVElOR19TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHRoaXMuZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50KSk7XG4gIH1cblxuICBkZXN0cm95QWN0aXZlQW5pbWF0aW9uc0ZvckVsZW1lbnQoZWxlbWVudDogYW55KSB7XG4gICAgY29uc3QgcGxheWVycyA9IHRoaXMucGxheWVyc0J5RWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBzZXQgZm9yIGRlc3RydWN0aW9uLCBidXQgaGFzbid0IHN0YXJ0ZWQuXG4gICAgICAgIC8vIGluIHRoaXMgc2l0dWF0aW9uIHdlIHdhbnQgdG8gZGVsYXkgdGhlIGRlc3RydWN0aW9uIHVudGlsIHRoZSBmbHVzaCBvY2N1cnNcbiAgICAgICAgLy8gc28gdGhhdCBhbnkgZXZlbnQgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBwbGF5ZXIgYXJlIHRyaWdnZXJlZC5cbiAgICAgICAgaWYgKHBsYXllci5xdWV1ZWQpIHtcbiAgICAgICAgICBwbGF5ZXIubWFya2VkRm9yRGVzdHJveSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZmluaXNoQWN0aXZlUXVlcmllZEFuaW1hdGlvbk9uRWxlbWVudChlbGVtZW50OiBhbnkpIHtcbiAgICBjb25zdCBwbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHBsYXllcnMpIHtcbiAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmZpbmlzaCgpKTtcbiAgICB9XG4gIH1cblxuICB3aGVuUmVuZGVyaW5nRG9uZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmICh0aGlzLnBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBvcHRpbWl6ZUdyb3VwUGxheWVyKHRoaXMucGxheWVycykub25Eb25lKCgpID0+IHJlc29sdmUoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzTGVhdmVOb2RlKGVsZW1lbnQ6IGFueSkge1xuICAgIGNvbnN0IGRldGFpbHMgPSBlbGVtZW50W1JFTU9WQUxfRkxBR10gYXMgRWxlbWVudEFuaW1hdGlvblN0YXRlO1xuICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yUmVtb3ZhbCkge1xuICAgICAgLy8gdGhpcyB3aWxsIHByZXZlbnQgaXQgZnJvbSByZW1vdmluZyBpdCB0d2ljZVxuICAgICAgZWxlbWVudFtSRU1PVkFMX0ZMQUddID0gTlVMTF9SRU1PVkFMX1NUQVRFO1xuICAgICAgaWYgKGRldGFpbHMubmFtZXNwYWNlSWQpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95SW5uZXJBbmltYXRpb25zKGVsZW1lbnQpO1xuICAgICAgICBjb25zdCBucyA9IHRoaXMuX2ZldGNoTmFtZXNwYWNlKGRldGFpbHMubmFtZXNwYWNlSWQpO1xuICAgICAgICBpZiAobnMpIHtcbiAgICAgICAgICBucy5jbGVhckVsZW1lbnRDYWNoZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fb25SZW1vdmFsQ29tcGxldGUoZWxlbWVudCwgZGV0YWlscy5zZXRGb3JSZW1vdmFsKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kcml2ZXIubWF0Y2hlc0VsZW1lbnQoZWxlbWVudCwgRElTQUJMRURfU0VMRUNUT1IpKSB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChlbGVtZW50LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgRElTQUJMRURfU0VMRUNUT1IsIHRydWUpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICB0aGlzLm1hcmtFbGVtZW50QXNEaXNhYmxlZChub2RlLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cblxuICBmbHVzaChtaWNyb3Rhc2tJZDogbnVtYmVyID0gLTEpIHtcbiAgICBsZXQgcGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBpZiAodGhpcy5uZXdIb3N0RWxlbWVudHMuc2l6ZSkge1xuICAgICAgdGhpcy5uZXdIb3N0RWxlbWVudHMuZm9yRWFjaCgobnMsIGVsZW1lbnQpID0+IHRoaXMuX2JhbGFuY2VOYW1lc3BhY2VMaXN0KG5zLCBlbGVtZW50KSk7XG4gICAgICB0aGlzLm5ld0hvc3RFbGVtZW50cy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRvdGFsQW5pbWF0aW9ucyAmJiB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29sbGVjdGVkRW50ZXJFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlbG0gPSB0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHNbaV07XG4gICAgICAgIGFkZENsYXNzKGVsbSwgU1RBUl9DTEFTU05BTUUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9uYW1lc3BhY2VMaXN0Lmxlbmd0aCAmJlxuICAgICAgICAodGhpcy50b3RhbFF1ZXVlZFBsYXllcnMgfHwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCkpIHtcbiAgICAgIGNvbnN0IGNsZWFudXBGbnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBsYXllcnMgPSB0aGlzLl9mbHVzaEFuaW1hdGlvbnMoY2xlYW51cEZucywgbWljcm90YXNrSWQpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGVhbnVwRm5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2xlYW51cEZuc1tpXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmNvbGxlY3RlZExlYXZlRWxlbWVudHNbaV07XG4gICAgICAgIHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRvdGFsUXVldWVkUGxheWVycyA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fZmx1c2hGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLl9mbHVzaEZucyA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX3doZW5RdWlldEZucy5sZW5ndGgpIHtcbiAgICAgIC8vIHdlIG1vdmUgdGhlc2Ugb3ZlciB0byBhIHZhcmlhYmxlIHNvIHRoYXRcbiAgICAgIC8vIGlmIGFueSBuZXcgY2FsbGJhY2tzIGFyZSByZWdpc3RlcmVkIGluIGFub3RoZXJcbiAgICAgIC8vIGZsdXNoIHRoZXkgZG8gbm90IHBvcHVsYXRlIHRoZSBleGlzdGluZyBzZXRcbiAgICAgIGNvbnN0IHF1aWV0Rm5zID0gdGhpcy5fd2hlblF1aWV0Rm5zO1xuICAgICAgdGhpcy5fd2hlblF1aWV0Rm5zID0gW107XG5cbiAgICAgIGlmIChwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiB7IHF1aWV0Rm5zLmZvckVhY2goZm4gPT4gZm4oKSk7IH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVpZXRGbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXBvcnRFcnJvcihlcnJvcnM6IHN0cmluZ1tdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIHByb2Nlc3MgYW5pbWF0aW9ucyBkdWUgdG8gdGhlIGZvbGxvd2luZyBmYWlsZWQgdHJpZ2dlciB0cmFuc2l0aW9uc1xcbiAke1xuICAgICAgICAgICAgZXJyb3JzLmpvaW4oJ1xcbicpfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmx1c2hBbmltYXRpb25zKGNsZWFudXBGbnM6IEZ1bmN0aW9uW10sIG1pY3JvdGFza0lkOiBudW1iZXIpOlxuICAgICAgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdIHtcbiAgICBjb25zdCBzdWJUaW1lbGluZXMgPSBuZXcgRWxlbWVudEluc3RydWN0aW9uTWFwKCk7XG4gICAgY29uc3Qgc2tpcHBlZFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IHNraXBwZWRQbGF5ZXJzTWFwID0gbmV3IE1hcDxhbnksIEFuaW1hdGlvblBsYXllcltdPigpO1xuICAgIGNvbnN0IHF1ZXVlZEluc3RydWN0aW9uczogUXVldWVkVHJhbnNpdGlvbltdID0gW107XG4gICAgY29uc3QgcXVlcmllZEVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgICBjb25zdCBhbGxQcmVTdHlsZUVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFNldDxzdHJpbmc+PigpO1xuICAgIGNvbnN0IGFsbFBvc3RTdHlsZUVsZW1lbnRzID0gbmV3IE1hcDxhbnksIFNldDxzdHJpbmc+PigpO1xuXG4gICAgY29uc3QgZGlzYWJsZWRFbGVtZW50c1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICAgIHRoaXMuZGlzYWJsZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgZGlzYWJsZWRFbGVtZW50c1NldC5hZGQobm9kZSk7XG4gICAgICBjb25zdCBub2Rlc1RoYXRBcmVEaXNhYmxlZCA9IHRoaXMuZHJpdmVyLnF1ZXJ5KG5vZGUsIFFVRVVFRF9TRUxFQ1RPUiwgdHJ1ZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzVGhhdEFyZURpc2FibGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRpc2FibGVkRWxlbWVudHNTZXQuYWRkKG5vZGVzVGhhdEFyZURpc2FibGVkW2ldKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGJvZHlOb2RlID0gdGhpcy5ib2R5Tm9kZTtcbiAgICBjb25zdCBhbGxUcmlnZ2VyRWxlbWVudHMgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGVzQnlFbGVtZW50LmtleXMoKSk7XG4gICAgY29uc3QgZW50ZXJOb2RlTWFwID0gYnVpbGRSb290TWFwKGFsbFRyaWdnZXJFbGVtZW50cywgdGhpcy5jb2xsZWN0ZWRFbnRlckVsZW1lbnRzKTtcblxuICAgIC8vIHRoaXMgbXVzdCBvY2N1ciBiZWZvcmUgdGhlIGluc3RydWN0aW9ucyBhcmUgYnVpbHQgYmVsb3cgc3VjaCB0aGF0XG4gICAgLy8gdGhlIDplbnRlciBxdWVyaWVzIG1hdGNoIHRoZSBlbGVtZW50cyAoc2luY2UgdGhlIHRpbWVsaW5lIHF1ZXJpZXNcbiAgICAvLyBhcmUgZmlyZWQgZHVyaW5nIGluc3RydWN0aW9uIGJ1aWxkaW5nKS5cbiAgICBjb25zdCBlbnRlck5vZGVNYXBJZHMgPSBuZXcgTWFwPGFueSwgc3RyaW5nPigpO1xuICAgIGxldCBpID0gMDtcbiAgICBlbnRlck5vZGVNYXAuZm9yRWFjaCgobm9kZXMsIHJvb3QpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IEVOVEVSX0NMQVNTTkFNRSArIGkrKztcbiAgICAgIGVudGVyTm9kZU1hcElkcy5zZXQocm9vdCwgY2xhc3NOYW1lKTtcbiAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBhZGRDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGFsbExlYXZlTm9kZXM6IGFueVtdID0gW107XG4gICAgY29uc3QgbWVyZ2VkTGVhdmVOb2RlcyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGxlYXZlTm9kZXNXaXRob3V0QW5pbWF0aW9ucyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5jb2xsZWN0ZWRMZWF2ZUVsZW1lbnRzW2ldO1xuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICBpZiAoZGV0YWlscyAmJiBkZXRhaWxzLnNldEZvclJlbW92YWwpIHtcbiAgICAgICAgYWxsTGVhdmVOb2Rlcy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICBtZXJnZWRMZWF2ZU5vZGVzLmFkZChlbGVtZW50KTtcbiAgICAgICAgaWYgKGRldGFpbHMuaGFzQW5pbWF0aW9uKSB7XG4gICAgICAgICAgdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgU1RBUl9TRUxFQ1RPUiwgdHJ1ZSkuZm9yRWFjaChlbG0gPT4gbWVyZ2VkTGVhdmVOb2Rlcy5hZGQoZWxtKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVhdmVOb2Rlc1dpdGhvdXRBbmltYXRpb25zLmFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxlYXZlTm9kZU1hcElkcyA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG4gICAgY29uc3QgbGVhdmVOb2RlTWFwID0gYnVpbGRSb290TWFwKGFsbFRyaWdnZXJFbGVtZW50cywgQXJyYXkuZnJvbShtZXJnZWRMZWF2ZU5vZGVzKSk7XG4gICAgbGVhdmVOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBMRUFWRV9DTEFTU05BTUUgKyBpKys7XG4gICAgICBsZWF2ZU5vZGVNYXBJZHMuc2V0KHJvb3QsIGNsYXNzTmFtZSk7XG4gICAgICBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gYWRkQ2xhc3Mobm9kZSwgY2xhc3NOYW1lKSk7XG4gICAgfSk7XG5cbiAgICBjbGVhbnVwRm5zLnB1c2goKCkgPT4ge1xuICAgICAgZW50ZXJOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGVudGVyTm9kZU1hcElkcy5nZXQocm9vdCkgITtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHJlbW92ZUNsYXNzKG5vZGUsIGNsYXNzTmFtZSkpO1xuICAgICAgfSk7XG5cbiAgICAgIGxlYXZlTm9kZU1hcC5mb3JFYWNoKChub2Rlcywgcm9vdCkgPT4ge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBsZWF2ZU5vZGVNYXBJZHMuZ2V0KHJvb3QpICE7XG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiByZW1vdmVDbGFzcyhub2RlLCBjbGFzc05hbWUpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhbGxMZWF2ZU5vZGVzLmZvckVhY2goZWxlbWVudCA9PiB7IHRoaXMucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KTsgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBhbGxQbGF5ZXJzOiBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgICBjb25zdCBlcnJvbmVvdXNUcmFuc2l0aW9uczogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5fbmFtZXNwYWNlTGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgbnMgPSB0aGlzLl9uYW1lc3BhY2VMaXN0W2ldO1xuICAgICAgbnMuZHJhaW5RdWV1ZWRUcmFuc2l0aW9ucyhtaWNyb3Rhc2tJZCkuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IGVudHJ5LnBsYXllcjtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVudHJ5LmVsZW1lbnQ7XG4gICAgICAgIGFsbFBsYXllcnMucHVzaChwbGF5ZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbGxlY3RlZEVudGVyRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICAgICAgLy8gbW92ZSBhbmltYXRpb25zIGFyZSBjdXJyZW50bHkgbm90IHN1cHBvcnRlZC4uLlxuICAgICAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuc2V0Rm9yTW92ZSkge1xuICAgICAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub2RlSXNPcnBoYW5lZCA9ICFib2R5Tm9kZSB8fCAhdGhpcy5kcml2ZXIuY29udGFpbnNFbGVtZW50KGJvZHlOb2RlLCBlbGVtZW50KTtcbiAgICAgICAgY29uc3QgbGVhdmVDbGFzc05hbWUgPSBsZWF2ZU5vZGVNYXBJZHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgIGNvbnN0IGVudGVyQ2xhc3NOYW1lID0gZW50ZXJOb2RlTWFwSWRzLmdldChlbGVtZW50KSAhO1xuICAgICAgICBjb25zdCBpbnN0cnVjdGlvbiA9IHRoaXMuX2J1aWxkSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICBlbnRyeSwgc3ViVGltZWxpbmVzLCBlbnRlckNsYXNzTmFtZSwgbGVhdmVDbGFzc05hbWUsIG5vZGVJc09ycGhhbmVkKSAhO1xuICAgICAgICBpZiAoaW5zdHJ1Y3Rpb24uZXJyb3JzICYmIGluc3RydWN0aW9uLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBlcnJvbmVvdXNUcmFuc2l0aW9ucy5wdXNoKGluc3RydWN0aW9uKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBldmVuIHRob3VnaCB0aGUgZWxlbWVudCBtYXkgbm90IGJlIGFwYXJ0IG9mIHRoZSBET00sIGl0IG1heVxuICAgICAgICAvLyBzdGlsbCBiZSBhZGRlZCBhdCBhIGxhdGVyIHBvaW50IChkdWUgdG8gdGhlIG1lY2hhbmljcyBvZiBjb250ZW50XG4gICAgICAgIC8vIHByb2plY3Rpb24gYW5kL29yIGR5bmFtaWMgY29tcG9uZW50IGluc2VydGlvbikgdGhlcmVmb3JlIGl0J3NcbiAgICAgICAgLy8gaW1wb3J0YW50IHdlIHN0aWxsIHN0eWxlIHRoZSBlbGVtZW50LlxuICAgICAgICBpZiAobm9kZUlzT3JwaGFuZWQpIHtcbiAgICAgICAgICBwbGF5ZXIub25TdGFydCgoKSA9PiBlcmFzZVN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi5mcm9tU3R5bGVzKSk7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgYSB1bm1hdGNoZWQgdHJhbnNpdGlvbiBpcyBxdWV1ZWQgdG8gZ28gdGhlbiBpdCBTSE9VTEQgTk9UIHJlbmRlclxuICAgICAgICAvLyBhbiBhbmltYXRpb24gYW5kIGNhbmNlbCB0aGUgcHJldmlvdXNseSBydW5uaW5nIGFuaW1hdGlvbnMuXG4gICAgICAgIGlmIChlbnRyeS5pc0ZhbGxiYWNrVHJhbnNpdGlvbikge1xuICAgICAgICAgIHBsYXllci5vblN0YXJ0KCgpID0+IGVyYXNlU3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHNldFN0eWxlcyhlbGVtZW50LCBpbnN0cnVjdGlvbi50b1N0eWxlcykpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgaWYgYSBwYXJlbnQgYW5pbWF0aW9uIHVzZXMgdGhpcyBhbmltYXRpb24gYXMgYSBzdWIgdHJpZ2dlclxuICAgICAgICAvLyB0aGVuIGl0IHdpbGwgaW5zdHJ1Y3QgdGhlIHRpbWVsaW5lIGJ1aWxkZXIgdG8gbm90IGFkZCBhIHBsYXllciBkZWxheSwgYnV0XG4gICAgICAgIC8vIGluc3RlYWQgc3RyZXRjaCB0aGUgZmlyc3Qga2V5ZnJhbWUgZ2FwIHVwIHVudGlsIHRoZSBhbmltYXRpb24gc3RhcnRzLiBUaGVcbiAgICAgICAgLy8gcmVhc29uIHRoaXMgaXMgaW1wb3J0YW50IGlzIHRvIHByZXZlbnQgZXh0cmEgaW5pdGlhbGl6YXRpb24gc3R5bGVzIGZyb20gYmVpbmdcbiAgICAgICAgLy8gcmVxdWlyZWQgYnkgdGhlIHVzZXIgaW4gdGhlIGFuaW1hdGlvbi5cbiAgICAgICAgaW5zdHJ1Y3Rpb24udGltZWxpbmVzLmZvckVhY2godGwgPT4gdGwuc3RyZXRjaFN0YXJ0aW5nS2V5ZnJhbWUgPSB0cnVlKTtcblxuICAgICAgICBzdWJUaW1lbGluZXMuYXBwZW5kKGVsZW1lbnQsIGluc3RydWN0aW9uLnRpbWVsaW5lcyk7XG5cbiAgICAgICAgY29uc3QgdHVwbGUgPSB7aW5zdHJ1Y3Rpb24sIHBsYXllciwgZWxlbWVudH07XG5cbiAgICAgICAgcXVldWVkSW5zdHJ1Y3Rpb25zLnB1c2godHVwbGUpO1xuXG4gICAgICAgIGluc3RydWN0aW9uLnF1ZXJpZWRFbGVtZW50cy5mb3JFYWNoKFxuICAgICAgICAgICAgZWxlbWVudCA9PiBnZXRPclNldEFzSW5NYXAocXVlcmllZEVsZW1lbnRzLCBlbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpKTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5wcmVTdHlsZVByb3BzLmZvckVhY2goKHN0cmluZ01hcCwgZWxlbWVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXMoc3RyaW5nTWFwKTtcbiAgICAgICAgICBpZiAocHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgc2V0VmFsOiBTZXQ8c3RyaW5nPiA9IGFsbFByZVN0eWxlRWxlbWVudHMuZ2V0KGVsZW1lbnQpICE7XG4gICAgICAgICAgICBpZiAoIXNldFZhbCkge1xuICAgICAgICAgICAgICBhbGxQcmVTdHlsZUVsZW1lbnRzLnNldChlbGVtZW50LCBzZXRWYWwgPSBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4gc2V0VmFsLmFkZChwcm9wKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpbnN0cnVjdGlvbi5wb3N0U3R5bGVQcm9wcy5mb3JFYWNoKChzdHJpbmdNYXAsIGVsZW1lbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHN0cmluZ01hcCk7XG4gICAgICAgICAgbGV0IHNldFZhbDogU2V0PHN0cmluZz4gPSBhbGxQb3N0U3R5bGVFbGVtZW50cy5nZXQoZWxlbWVudCkgITtcbiAgICAgICAgICBpZiAoIXNldFZhbCkge1xuICAgICAgICAgICAgYWxsUG9zdFN0eWxlRWxlbWVudHMuc2V0KGVsZW1lbnQsIHNldFZhbCA9IG5ldyBTZXQ8c3RyaW5nPigpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHNldFZhbC5hZGQocHJvcCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChlcnJvbmVvdXNUcmFuc2l0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGVycm9uZW91c1RyYW5zaXRpb25zLmZvckVhY2goaW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgICBlcnJvcnMucHVzaChgQCR7aW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWV9IGhhcyBmYWlsZWQgZHVlIHRvOlxcbmApO1xuICAgICAgICBpbnN0cnVjdGlvbi5lcnJvcnMgIS5mb3JFYWNoKGVycm9yID0+IGVycm9ycy5wdXNoKGAtICR7ZXJyb3J9XFxuYCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGFsbFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4gcGxheWVyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLnJlcG9ydEVycm9yKGVycm9ycyk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxsUHJldmlvdXNQbGF5ZXJzTWFwID0gbmV3IE1hcDxhbnksIFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXT4oKTtcbiAgICAvLyB0aGlzIG1hcCB3b3JrcyB0byB0ZWxsIHdoaWNoIGVsZW1lbnQgaW4gdGhlIERPTSB0cmVlIGlzIGNvbnRhaW5lZCBieVxuICAgIC8vIHdoaWNoIGFuaW1hdGlvbi4gRnVydGhlciBkb3duIGJlbG93IHRoaXMgbWFwIHdpbGwgZ2V0IHBvcHVsYXRlZCBvbmNlXG4gICAgLy8gdGhlIHBsYXllcnMgYXJlIGJ1aWx0IGFuZCBpbiBkb2luZyBzbyBpdCBjYW4gZWZmaWNpZW50bHkgZmlndXJlIG91dFxuICAgIC8vIGlmIGEgc3ViIHBsYXllciBpcyBza2lwcGVkIGR1ZSB0byBhIHBhcmVudCBwbGF5ZXIgaGF2aW5nIHByaW9yaXR5LlxuICAgIGNvbnN0IGFuaW1hdGlvbkVsZW1lbnRNYXAgPSBuZXcgTWFwPGFueSwgYW55PigpO1xuICAgIHF1ZXVlZEluc3RydWN0aW9ucy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbnRyeS5lbGVtZW50O1xuICAgICAgaWYgKHN1YlRpbWVsaW5lcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgYW5pbWF0aW9uRWxlbWVudE1hcC5zZXQoZWxlbWVudCwgZWxlbWVudCk7XG4gICAgICAgIHRoaXMuX2JlZm9yZUFuaW1hdGlvbkJ1aWxkKFxuICAgICAgICAgICAgZW50cnkucGxheWVyLm5hbWVzcGFjZUlkLCBlbnRyeS5pbnN0cnVjdGlvbiwgYWxsUHJldmlvdXNQbGF5ZXJzTWFwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNraXBwZWRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBwbGF5ZXIuZWxlbWVudDtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGxheWVycyA9XG4gICAgICAgICAgdGhpcy5fZ2V0UHJldmlvdXNQbGF5ZXJzKGVsZW1lbnQsIGZhbHNlLCBwbGF5ZXIubmFtZXNwYWNlSWQsIHBsYXllci50cmlnZ2VyTmFtZSwgbnVsbCk7XG4gICAgICBwcmV2aW91c1BsYXllcnMuZm9yRWFjaChwcmV2UGxheWVyID0+IHtcbiAgICAgICAgZ2V0T3JTZXRBc0luTWFwKGFsbFByZXZpb3VzUGxheWVyc01hcCwgZWxlbWVudCwgW10pLnB1c2gocHJldlBsYXllcik7XG4gICAgICAgIHByZXZQbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbCBjYXNlIGZvciBub2RlcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZCAoZWl0aGVyIGJ5KVxuICAgIC8vIGhhdmluZyB0aGVpciBvd24gbGVhdmUgYW5pbWF0aW9ucyBvciBieSBiZWluZyBxdWVyaWVkIGluIGEgY29udGFpbmVyXG4gICAgLy8gdGhhdCB3aWxsIGJlIHJlbW92ZWQgb25jZSBhIHBhcmVudCBhbmltYXRpb24gaXMgY29tcGxldGUuIFRoZSBpZGVhXG4gICAgLy8gaGVyZSBpcyB0aGF0ICogc3R5bGVzIG11c3QgYmUgaWRlbnRpY2FsIHRvICEgc3R5bGVzIGJlY2F1c2Ugb2ZcbiAgICAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSAoKiBpcyBhbHNvIGZpbGxlZCBpbiBieSBkZWZhdWx0IGluIG1hbnkgcGxhY2VzKS5cbiAgICAvLyBPdGhlcndpc2UgKiBzdHlsZXMgd2lsbCByZXR1cm4gYW4gZW1wdHkgdmFsdWUgb3IgYXV0byBzaW5jZSB0aGUgZWxlbWVudFxuICAgIC8vIHRoYXQgaXMgYmVpbmcgZ2V0Q29tcHV0ZWRTdHlsZSdkIHdpbGwgbm90IGJlIHZpc2libGUgKHNpbmNlICogPSBkZXN0aW5hdGlvbilcbiAgICBjb25zdCByZXBsYWNlTm9kZXMgPSBhbGxMZWF2ZU5vZGVzLmZpbHRlcihub2RlID0+IHtcbiAgICAgIHJldHVybiByZXBsYWNlUG9zdFN0eWxlc0FzUHJlKG5vZGUsIGFsbFByZVN0eWxlRWxlbWVudHMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzKTtcbiAgICB9KTtcblxuICAgIC8vIFBPU1QgU1RBR0U6IGZpbGwgdGhlICogc3R5bGVzXG4gICAgY29uc3QgcG9zdFN0eWxlc01hcCA9IG5ldyBNYXA8YW55LCDJtVN0eWxlRGF0YT4oKTtcbiAgICBjb25zdCBhbGxMZWF2ZVF1ZXJpZWROb2RlcyA9IGNsb2FrQW5kQ29tcHV0ZVN0eWxlcyhcbiAgICAgICAgcG9zdFN0eWxlc01hcCwgdGhpcy5kcml2ZXIsIGxlYXZlTm9kZXNXaXRob3V0QW5pbWF0aW9ucywgYWxsUG9zdFN0eWxlRWxlbWVudHMsIEFVVE9fU1RZTEUpO1xuXG4gICAgYWxsTGVhdmVRdWVyaWVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGlmIChyZXBsYWNlUG9zdFN0eWxlc0FzUHJlKG5vZGUsIGFsbFByZVN0eWxlRWxlbWVudHMsIGFsbFBvc3RTdHlsZUVsZW1lbnRzKSkge1xuICAgICAgICByZXBsYWNlTm9kZXMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFBSRSBTVEFHRTogZmlsbCB0aGUgISBzdHlsZXNcbiAgICBjb25zdCBwcmVTdHlsZXNNYXAgPSBuZXcgTWFwPGFueSwgybVTdHlsZURhdGE+KCk7XG4gICAgZW50ZXJOb2RlTWFwLmZvckVhY2goKG5vZGVzLCByb290KSA9PiB7XG4gICAgICBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgICAgICAgcHJlU3R5bGVzTWFwLCB0aGlzLmRyaXZlciwgbmV3IFNldChub2RlcyksIGFsbFByZVN0eWxlRWxlbWVudHMsIFBSRV9TVFlMRSk7XG4gICAgfSk7XG5cbiAgICByZXBsYWNlTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGNvbnN0IHBvc3QgPSBwb3N0U3R5bGVzTWFwLmdldChub2RlKTtcbiAgICAgIGNvbnN0IHByZSA9IHByZVN0eWxlc01hcC5nZXQobm9kZSk7XG4gICAgICBwb3N0U3R5bGVzTWFwLnNldChub2RlLCB7IC4uLnBvc3QsIC4uLnByZSB9IGFzIGFueSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCByb290UGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3Qgc3ViUGxheWVyczogVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllcltdID0gW107XG4gICAgY29uc3QgTk9fUEFSRU5UX0FOSU1BVElPTl9FTEVNRU5UX0RFVEVDVEVEID0ge307XG4gICAgcXVldWVkSW5zdHJ1Y3Rpb25zLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgY29uc3Qge2VsZW1lbnQsIHBsYXllciwgaW5zdHJ1Y3Rpb259ID0gZW50cnk7XG4gICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgaXQgd2FzIG5ldmVyIGNvbnN1bWVkIGJ5IGEgcGFyZW50IGFuaW1hdGlvbiB3aGljaFxuICAgICAgLy8gbWVhbnMgdGhhdCBpdCBpcyBpbmRlcGVuZGVudCBhbmQgdGhlcmVmb3JlIHNob3VsZCBiZSBzZXQgZm9yIGFuaW1hdGlvblxuICAgICAgaWYgKHN1YlRpbWVsaW5lcy5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgaWYgKGRpc2FibGVkRWxlbWVudHNTZXQuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBzZXRTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpKTtcbiAgICAgICAgICBwbGF5ZXIuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgIHBsYXllci5vdmVycmlkZVRvdGFsVGltZShpbnN0cnVjdGlvbi50b3RhbFRpbWUpO1xuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGlzIHdpbGwgZmxvdyB1cCB0aGUgRE9NIGFuZCBxdWVyeSB0aGUgbWFwIHRvIGZpZ3VyZSBvdXRcbiAgICAgICAgLy8gaWYgYSBwYXJlbnQgYW5pbWF0aW9uIGhhcyBwcmlvcml0eSBvdmVyIGl0LiBJbiB0aGUgc2l0dWF0aW9uXG4gICAgICAgIC8vIHRoYXQgYSBwYXJlbnQgaXMgZGV0ZWN0ZWQgdGhlbiBpdCB3aWxsIGNhbmNlbCB0aGUgbG9vcC4gSWZcbiAgICAgICAgLy8gbm90aGluZyBpcyBkZXRlY3RlZCwgb3IgaXQgdGFrZXMgYSBmZXcgaG9wcyB0byBmaW5kIGEgcGFyZW50LFxuICAgICAgICAvLyB0aGVuIGl0IHdpbGwgZmlsbCBpbiB0aGUgbWlzc2luZyBub2RlcyBhbmQgc2lnbmFsIHRoZW0gYXMgaGF2aW5nXG4gICAgICAgIC8vIGEgZGV0ZWN0ZWQgcGFyZW50IChvciBhIE5PX1BBUkVOVCB2YWx1ZSB2aWEgYSBzcGVjaWFsIGNvbnN0YW50KS5cbiAgICAgICAgbGV0IHBhcmVudFdpdGhBbmltYXRpb246IGFueSA9IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRDtcbiAgICAgICAgaWYgKGFuaW1hdGlvbkVsZW1lbnRNYXAuc2l6ZSA+IDEpIHtcbiAgICAgICAgICBsZXQgZWxtID0gZWxlbWVudDtcbiAgICAgICAgICBjb25zdCBwYXJlbnRzVG9BZGQ6IGFueVtdID0gW107XG4gICAgICAgICAgd2hpbGUgKGVsbSA9IGVsbS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBjb25zdCBkZXRlY3RlZFBhcmVudCA9IGFuaW1hdGlvbkVsZW1lbnRNYXAuZ2V0KGVsbSk7XG4gICAgICAgICAgICBpZiAoZGV0ZWN0ZWRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgcGFyZW50V2l0aEFuaW1hdGlvbiA9IGRldGVjdGVkUGFyZW50O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmVudHNUb0FkZC5wdXNoKGVsbSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmVudHNUb0FkZC5mb3JFYWNoKHBhcmVudCA9PiBhbmltYXRpb25FbGVtZW50TWFwLnNldChwYXJlbnQsIHBhcmVudFdpdGhBbmltYXRpb24pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyUGxheWVyID0gdGhpcy5fYnVpbGRBbmltYXRpb24oXG4gICAgICAgICAgICBwbGF5ZXIubmFtZXNwYWNlSWQsIGluc3RydWN0aW9uLCBhbGxQcmV2aW91c1BsYXllcnNNYXAsIHNraXBwZWRQbGF5ZXJzTWFwLCBwcmVTdHlsZXNNYXAsXG4gICAgICAgICAgICBwb3N0U3R5bGVzTWFwKTtcblxuICAgICAgICBwbGF5ZXIuc2V0UmVhbFBsYXllcihpbm5lclBsYXllcik7XG5cbiAgICAgICAgaWYgKHBhcmVudFdpdGhBbmltYXRpb24gPT09IE5PX1BBUkVOVF9BTklNQVRJT05fRUxFTUVOVF9ERVRFQ1RFRCkge1xuICAgICAgICAgIHJvb3RQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRQbGF5ZXJzID0gdGhpcy5wbGF5ZXJzQnlFbGVtZW50LmdldChwYXJlbnRXaXRoQW5pbWF0aW9uKTtcbiAgICAgICAgICBpZiAocGFyZW50UGxheWVycyAmJiBwYXJlbnRQbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGxheWVyLnBhcmVudFBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIocGFyZW50UGxheWVycyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNraXBwZWRQbGF5ZXJzLnB1c2gocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJhc2VTdHlsZXMoZWxlbWVudCwgaW5zdHJ1Y3Rpb24uZnJvbVN0eWxlcyk7XG4gICAgICAgIHBsYXllci5vbkRlc3Ryb3koKCkgPT4gc2V0U3R5bGVzKGVsZW1lbnQsIGluc3RydWN0aW9uLnRvU3R5bGVzKSk7XG4gICAgICAgIC8vIHRoZXJlIHN0aWxsIG1pZ2h0IGJlIGEgYW5jZXN0b3IgcGxheWVyIGFuaW1hdGluZyB0aGlzXG4gICAgICAgIC8vIGVsZW1lbnQgdGhlcmVmb3JlIHdlIHdpbGwgc3RpbGwgYWRkIGl0IGFzIGEgc3ViIHBsYXllclxuICAgICAgICAvLyBldmVuIGlmIGl0cyBhbmltYXRpb24gbWF5IGJlIGRpc2FibGVkXG4gICAgICAgIHN1YlBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICBpZiAoZGlzYWJsZWRFbGVtZW50c1NldC5oYXMoZWxlbWVudCkpIHtcbiAgICAgICAgICBza2lwcGVkUGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGZpbmQgYWxsIG9mIHRoZSBzdWIgcGxheWVycycgY29ycmVzcG9uZGluZyBpbm5lciBhbmltYXRpb24gcGxheWVyXG4gICAgc3ViUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAvLyBldmVuIGlmIGFueSBwbGF5ZXJzIGFyZSBub3QgZm91bmQgZm9yIGEgc3ViIGFuaW1hdGlvbiB0aGVuIGl0XG4gICAgICAvLyB3aWxsIHN0aWxsIGNvbXBsZXRlIGl0c2VsZiBhZnRlciB0aGUgbmV4dCB0aWNrIHNpbmNlIGl0J3MgTm9vcFxuICAgICAgY29uc3QgcGxheWVyc0ZvckVsZW1lbnQgPSBza2lwcGVkUGxheWVyc01hcC5nZXQocGxheWVyLmVsZW1lbnQpO1xuICAgICAgaWYgKHBsYXllcnNGb3JFbGVtZW50ICYmIHBsYXllcnNGb3JFbGVtZW50Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbm5lclBsYXllciA9IG9wdGltaXplR3JvdXBQbGF5ZXIocGxheWVyc0ZvckVsZW1lbnQpO1xuICAgICAgICBwbGF5ZXIuc2V0UmVhbFBsYXllcihpbm5lclBsYXllcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB0aGUgcmVhc29uIHdoeSB3ZSBkb24ndCBhY3R1YWxseSBwbGF5IHRoZSBhbmltYXRpb24gaXNcbiAgICAvLyBiZWNhdXNlIGFsbCB0aGF0IGEgc2tpcHBlZCBwbGF5ZXIgaXMgZGVzaWduZWQgdG8gZG8gaXMgdG9cbiAgICAvLyBmaXJlIHRoZSBzdGFydC9kb25lIHRyYW5zaXRpb24gY2FsbGJhY2sgZXZlbnRzXG4gICAgc2tpcHBlZFBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgaWYgKHBsYXllci5wYXJlbnRQbGF5ZXIpIHtcbiAgICAgICAgcGxheWVyLnN5bmNQbGF5ZXJFdmVudHMocGxheWVyLnBhcmVudFBsYXllcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gcnVuIHRocm91Z2ggYWxsIG9mIHRoZSBxdWV1ZWQgcmVtb3ZhbHMgYW5kIHNlZSBpZiB0aGV5XG4gICAgLy8gd2VyZSBwaWNrZWQgdXAgYnkgYSBxdWVyeS4gSWYgbm90IHRoZW4gcGVyZm9ybSB0aGUgcmVtb3ZhbFxuICAgIC8vIG9wZXJhdGlvbiByaWdodCBhd2F5IHVubGVzcyBhIHBhcmVudCBhbmltYXRpb24gaXMgb25nb2luZy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbExlYXZlTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBhbGxMZWF2ZU5vZGVzW2ldO1xuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgICByZW1vdmVDbGFzcyhlbGVtZW50LCBMRUFWRV9DTEFTU05BTUUpO1xuXG4gICAgICAvLyB0aGlzIG1lYW5zIHRoZSBlbGVtZW50IGhhcyBhIHJlbW92YWwgYW5pbWF0aW9uIHRoYXQgaXMgYmVpbmdcbiAgICAgIC8vIHRha2VuIGNhcmUgb2YgYW5kIHRoZXJlZm9yZSB0aGUgaW5uZXIgZWxlbWVudHMgd2lsbCBoYW5nIGFyb3VuZFxuICAgICAgLy8gdW50aWwgdGhhdCBhbmltYXRpb24gaXMgb3ZlciAob3IgdGhlIHBhcmVudCBxdWVyaWVkIGFuaW1hdGlvbilcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMuaGFzQW5pbWF0aW9uKSBjb250aW51ZTtcblxuICAgICAgbGV0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuXG4gICAgICAvLyBpZiB0aGlzIGVsZW1lbnQgaXMgcXVlcmllZCBvciBpZiBpdCBjb250YWlucyBxdWVyaWVkIGNoaWxkcmVuXG4gICAgICAvLyB0aGVuIHdlIHdhbnQgZm9yIHRoZSBlbGVtZW50IG5vdCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHBhZ2VcbiAgICAgIC8vIHVudGlsIHRoZSBxdWVyaWVkIGFuaW1hdGlvbnMgaGF2ZSBmaW5pc2hlZFxuICAgICAgaWYgKHF1ZXJpZWRFbGVtZW50cy5zaXplKSB7XG4gICAgICAgIGxldCBxdWVyaWVkUGxheWVyUmVzdWx0cyA9IHF1ZXJpZWRFbGVtZW50cy5nZXQoZWxlbWVudCk7XG4gICAgICAgIGlmIChxdWVyaWVkUGxheWVyUmVzdWx0cyAmJiBxdWVyaWVkUGxheWVyUmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICBwbGF5ZXJzLnB1c2goLi4ucXVlcmllZFBsYXllclJlc3VsdHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHF1ZXJpZWRJbm5lckVsZW1lbnRzID0gdGhpcy5kcml2ZXIucXVlcnkoZWxlbWVudCwgTkdfQU5JTUFUSU5HX1NFTEVDVE9SLCB0cnVlKTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBxdWVyaWVkSW5uZXJFbGVtZW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGxldCBxdWVyaWVkUGxheWVycyA9IHF1ZXJpZWRFbGVtZW50cy5nZXQocXVlcmllZElubmVyRWxlbWVudHNbal0pO1xuICAgICAgICAgIGlmIChxdWVyaWVkUGxheWVycyAmJiBxdWVyaWVkUGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBsYXllcnMucHVzaCguLi5xdWVyaWVkUGxheWVycyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFjdGl2ZVBsYXllcnMgPSBwbGF5ZXJzLmZpbHRlcihwID0+ICFwLmRlc3Ryb3llZCk7XG4gICAgICBpZiAoYWN0aXZlUGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXNBZnRlckFuaW1hdGlvbkRvbmUodGhpcywgZWxlbWVudCwgYWN0aXZlUGxheWVycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb2Nlc3NMZWF2ZU5vZGUoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyByZXF1aXJlZCBzbyB0aGUgY2xlYW51cCBtZXRob2QgZG9lc24ndCByZW1vdmUgdGhlbVxuICAgIGFsbExlYXZlTm9kZXMubGVuZ3RoID0gMDtcblxuICAgIHJvb3RQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IHtcbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucGxheWVycy5pbmRleE9mKHBsYXllcik7XG4gICAgICAgIHRoaXMucGxheWVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfSk7XG4gICAgICBwbGF5ZXIucGxheSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJvb3RQbGF5ZXJzO1xuICB9XG5cbiAgZWxlbWVudENvbnRhaW5zRGF0YShuYW1lc3BhY2VJZDogc3RyaW5nLCBlbGVtZW50OiBhbnkpIHtcbiAgICBsZXQgY29udGFpbnNEYXRhID0gZmFsc2U7XG4gICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSBhcyBFbGVtZW50QW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKGRldGFpbHMgJiYgZGV0YWlscy5zZXRGb3JSZW1vdmFsKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnBsYXllcnNCeUVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIGlmICh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmhhcyhlbGVtZW50KSkgY29udGFpbnNEYXRhID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5zdGF0ZXNCeUVsZW1lbnQuaGFzKGVsZW1lbnQpKSBjb250YWluc0RhdGEgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9mZXRjaE5hbWVzcGFjZShuYW1lc3BhY2VJZCkuZWxlbWVudENvbnRhaW5zRGF0YShlbGVtZW50KSB8fCBjb250YWluc0RhdGE7XG4gIH1cblxuICBhZnRlckZsdXNoKGNhbGxiYWNrOiAoKSA9PiBhbnkpIHsgdGhpcy5fZmx1c2hGbnMucHVzaChjYWxsYmFjayk7IH1cblxuICBhZnRlckZsdXNoQW5pbWF0aW9uc0RvbmUoY2FsbGJhY2s6ICgpID0+IGFueSkgeyB0aGlzLl93aGVuUXVpZXRGbnMucHVzaChjYWxsYmFjayk7IH1cblxuICBwcml2YXRlIF9nZXRQcmV2aW91c1BsYXllcnMoXG4gICAgICBlbGVtZW50OiBzdHJpbmcsIGlzUXVlcmllZEVsZW1lbnQ6IGJvb2xlYW4sIG5hbWVzcGFjZUlkPzogc3RyaW5nLCB0cmlnZ2VyTmFtZT86IHN0cmluZyxcbiAgICAgIHRvU3RhdGVWYWx1ZT86IGFueSk6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSB7XG4gICAgbGV0IHBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGlmIChpc1F1ZXJpZWRFbGVtZW50KSB7XG4gICAgICBjb25zdCBxdWVyaWVkRWxlbWVudFBsYXllcnMgPSB0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LmdldChlbGVtZW50KTtcbiAgICAgIGlmIChxdWVyaWVkRWxlbWVudFBsYXllcnMpIHtcbiAgICAgICAgcGxheWVycyA9IHF1ZXJpZWRFbGVtZW50UGxheWVycztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZWxlbWVudFBsYXllcnMgPSB0aGlzLnBsYXllcnNCeUVsZW1lbnQuZ2V0KGVsZW1lbnQpO1xuICAgICAgaWYgKGVsZW1lbnRQbGF5ZXJzKSB7XG4gICAgICAgIGNvbnN0IGlzUmVtb3ZhbEFuaW1hdGlvbiA9ICF0b1N0YXRlVmFsdWUgfHwgdG9TdGF0ZVZhbHVlID09IFZPSURfVkFMVUU7XG4gICAgICAgIGVsZW1lbnRQbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICBpZiAocGxheWVyLnF1ZXVlZCkgcmV0dXJuO1xuICAgICAgICAgIGlmICghaXNSZW1vdmFsQW5pbWF0aW9uICYmIHBsYXllci50cmlnZ2VyTmFtZSAhPSB0cmlnZ2VyTmFtZSkgcmV0dXJuO1xuICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hbWVzcGFjZUlkIHx8IHRyaWdnZXJOYW1lKSB7XG4gICAgICBwbGF5ZXJzID0gcGxheWVycy5maWx0ZXIocGxheWVyID0+IHtcbiAgICAgICAgaWYgKG5hbWVzcGFjZUlkICYmIG5hbWVzcGFjZUlkICE9IHBsYXllci5uYW1lc3BhY2VJZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodHJpZ2dlck5hbWUgJiYgdHJpZ2dlck5hbWUgIT0gcGxheWVyLnRyaWdnZXJOYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwbGF5ZXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYmVmb3JlQW5pbWF0aW9uQnVpbGQoXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLFxuICAgICAgYWxsUHJldmlvdXNQbGF5ZXJzTWFwOiBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+KSB7XG4gICAgY29uc3QgdHJpZ2dlck5hbWUgPSBpbnN0cnVjdGlvbi50cmlnZ2VyTmFtZTtcbiAgICBjb25zdCByb290RWxlbWVudCA9IGluc3RydWN0aW9uLmVsZW1lbnQ7XG5cbiAgICAvLyB3aGVuIGEgcmVtb3ZhbCBhbmltYXRpb24gb2NjdXJzLCBBTEwgcHJldmlvdXMgcGxheWVycyBhcmUgY29sbGVjdGVkXG4gICAgLy8gYW5kIGRlc3Ryb3llZCAoZXZlbiBpZiB0aGV5IGFyZSBvdXRzaWRlIG9mIHRoZSBjdXJyZW50IG5hbWVzcGFjZSlcbiAgICBjb25zdCB0YXJnZXROYW1lU3BhY2VJZDogc3RyaW5nfHVuZGVmaW5lZCA9XG4gICAgICAgIGluc3RydWN0aW9uLmlzUmVtb3ZhbFRyYW5zaXRpb24gPyB1bmRlZmluZWQgOiBuYW1lc3BhY2VJZDtcbiAgICBjb25zdCB0YXJnZXRUcmlnZ2VyTmFtZTogc3RyaW5nfHVuZGVmaW5lZCA9XG4gICAgICAgIGluc3RydWN0aW9uLmlzUmVtb3ZhbFRyYW5zaXRpb24gPyB1bmRlZmluZWQgOiB0cmlnZ2VyTmFtZTtcblxuICAgIGZvciAoY29uc3QgdGltZWxpbmVJbnN0cnVjdGlvbiBvZiBpbnN0cnVjdGlvbi50aW1lbGluZXMpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aW1lbGluZUluc3RydWN0aW9uLmVsZW1lbnQ7XG4gICAgICBjb25zdCBpc1F1ZXJpZWRFbGVtZW50ID0gZWxlbWVudCAhPT0gcm9vdEVsZW1lbnQ7XG4gICAgICBjb25zdCBwbGF5ZXJzID0gZ2V0T3JTZXRBc0luTWFwKGFsbFByZXZpb3VzUGxheWVyc01hcCwgZWxlbWVudCwgW10pO1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID0gdGhpcy5fZ2V0UHJldmlvdXNQbGF5ZXJzKFxuICAgICAgICAgIGVsZW1lbnQsIGlzUXVlcmllZEVsZW1lbnQsIHRhcmdldE5hbWVTcGFjZUlkLCB0YXJnZXRUcmlnZ2VyTmFtZSwgaW5zdHJ1Y3Rpb24udG9TdGF0ZSk7XG4gICAgICBwcmV2aW91c1BsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBjb25zdCByZWFsUGxheWVyID0gKHBsYXllciBhcyBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyKS5nZXRSZWFsUGxheWVyKCkgYXMgYW55O1xuICAgICAgICBpZiAocmVhbFBsYXllci5iZWZvcmVEZXN0cm95KSB7XG4gICAgICAgICAgcmVhbFBsYXllci5iZWZvcmVEZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgcGxheWVycy5wdXNoKHBsYXllcik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIG5lZWRzIHRvIGJlIGRvbmUgc28gdGhhdCB0aGUgUFJFL1BPU1Qgc3R5bGVzIGNhbiBiZVxuICAgIC8vIGNvbXB1dGVkIHByb3Blcmx5IHdpdGhvdXQgaW50ZXJmZXJpbmcgd2l0aCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uXG4gICAgZXJhc2VTdHlsZXMocm9vdEVsZW1lbnQsIGluc3RydWN0aW9uLmZyb21TdHlsZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBbmltYXRpb24oXG4gICAgICBuYW1lc3BhY2VJZDogc3RyaW5nLCBpbnN0cnVjdGlvbjogQW5pbWF0aW9uVHJhbnNpdGlvbkluc3RydWN0aW9uLFxuICAgICAgYWxsUHJldmlvdXNQbGF5ZXJzTWFwOiBNYXA8YW55LCBUcmFuc2l0aW9uQW5pbWF0aW9uUGxheWVyW10+LFxuICAgICAgc2tpcHBlZFBsYXllcnNNYXA6IE1hcDxhbnksIEFuaW1hdGlvblBsYXllcltdPiwgcHJlU3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4sXG4gICAgICBwb3N0U3R5bGVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4pOiBBbmltYXRpb25QbGF5ZXIge1xuICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gaW5zdHJ1Y3Rpb24udHJpZ2dlck5hbWU7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBpbnN0cnVjdGlvbi5lbGVtZW50O1xuXG4gICAgLy8gd2UgZmlyc3QgcnVuIHRoaXMgc28gdGhhdCB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIHBsYXllclxuICAgIC8vIGRhdGEgY2FuIGJlIHBhc3NlZCBpbnRvIHRoZSBzdWNjZXNzaXZlIGFuaW1hdGlvbiBwbGF5ZXJzXG4gICAgY29uc3QgYWxsUXVlcmllZFBsYXllcnM6IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXJbXSA9IFtdO1xuICAgIGNvbnN0IGFsbENvbnN1bWVkRWxlbWVudHMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICBjb25zdCBhbGxTdWJFbGVtZW50cyA9IG5ldyBTZXQ8YW55PigpO1xuICAgIGNvbnN0IGFsbE5ld1BsYXllcnMgPSBpbnN0cnVjdGlvbi50aW1lbGluZXMubWFwKHRpbWVsaW5lSW5zdHJ1Y3Rpb24gPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRpbWVsaW5lSW5zdHJ1Y3Rpb24uZWxlbWVudDtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuXG4gICAgICAvLyBGSVhNRSAobWF0c2tvKTogbWFrZSBzdXJlIHRvLWJlLXJlbW92ZWQgYW5pbWF0aW9ucyBhcmUgcmVtb3ZlZCBwcm9wZXJseVxuICAgICAgY29uc3QgZGV0YWlscyA9IGVsZW1lbnRbUkVNT1ZBTF9GTEFHXTtcbiAgICAgIGlmIChkZXRhaWxzICYmIGRldGFpbHMucmVtb3ZlZEJlZm9yZVF1ZXJpZWQpXG4gICAgICAgIHJldHVybiBuZXcgTm9vcEFuaW1hdGlvblBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLmR1cmF0aW9uLCB0aW1lbGluZUluc3RydWN0aW9uLmRlbGF5KTtcblxuICAgICAgY29uc3QgaXNRdWVyaWVkRWxlbWVudCA9IGVsZW1lbnQgIT09IHJvb3RFbGVtZW50O1xuICAgICAgY29uc3QgcHJldmlvdXNQbGF5ZXJzID1cbiAgICAgICAgICBmbGF0dGVuR3JvdXBQbGF5ZXJzKChhbGxQcmV2aW91c1BsYXllcnNNYXAuZ2V0KGVsZW1lbnQpIHx8IEVNUFRZX1BMQVlFUl9BUlJBWSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHAgPT4gcC5nZXRSZWFsUGxheWVyKCkpKVxuICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBgZWxlbWVudGAgaXMgbm90IGFwYXJ0IG9mIHRoZSBBbmltYXRpb25QbGF5ZXIgZGVmaW5pdGlvbiwgYnV0XG4gICAgICAgICAgICAgICAgLy8gTW9jay9XZWJBbmltYXRpb25zXG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBlbGVtZW50IHdpdGhpbiB0aGVpciBpbXBsZW1lbnRhdGlvbi4gVGhpcyB3aWxsIGJlIGFkZGVkIGluIEFuZ3VsYXI1IHRvXG4gICAgICAgICAgICAgICAgLy8gQW5pbWF0aW9uUGxheWVyXG4gICAgICAgICAgICAgICAgY29uc3QgcHAgPSBwIGFzIGFueTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHAuZWxlbWVudCA/IHBwLmVsZW1lbnQgPT09IGVsZW1lbnQgOiBmYWxzZTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHByZVN0eWxlcyA9IHByZVN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBwb3N0U3R5bGVzID0gcG9zdFN0eWxlc01hcC5nZXQoZWxlbWVudCk7XG4gICAgICBjb25zdCBrZXlmcmFtZXMgPSBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgICAgICAgdGhpcy5kcml2ZXIsIHRoaXMuX25vcm1hbGl6ZXIsIGVsZW1lbnQsIHRpbWVsaW5lSW5zdHJ1Y3Rpb24ua2V5ZnJhbWVzLCBwcmVTdHlsZXMsXG4gICAgICAgICAgcG9zdFN0eWxlcyk7XG4gICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLl9idWlsZFBsYXllcih0aW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXMsIHByZXZpb3VzUGxheWVycyk7XG5cbiAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGlzIHBhcnRpY3VsYXIgcGxheWVyIGJlbG9uZ3MgdG8gYSBzdWIgdHJpZ2dlci4gSXQgaXNcbiAgICAgIC8vIGltcG9ydGFudCB0aGF0IHdlIG1hdGNoIHRoaXMgcGxheWVyIHVwIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgKEB0cmlnZ2VyLmxpc3RlbmVyKVxuICAgICAgaWYgKHRpbWVsaW5lSW5zdHJ1Y3Rpb24uc3ViVGltZWxpbmUgJiYgc2tpcHBlZFBsYXllcnNNYXApIHtcbiAgICAgICAgYWxsU3ViRWxlbWVudHMuYWRkKGVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNRdWVyaWVkRWxlbWVudCkge1xuICAgICAgICBjb25zdCB3cmFwcGVkUGxheWVyID0gbmV3IFRyYW5zaXRpb25BbmltYXRpb25QbGF5ZXIobmFtZXNwYWNlSWQsIHRyaWdnZXJOYW1lLCBlbGVtZW50KTtcbiAgICAgICAgd3JhcHBlZFBsYXllci5zZXRSZWFsUGxheWVyKHBsYXllcik7XG4gICAgICAgIGFsbFF1ZXJpZWRQbGF5ZXJzLnB1c2god3JhcHBlZFBsYXllcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgfSk7XG5cbiAgICBhbGxRdWVyaWVkUGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICBnZXRPclNldEFzSW5NYXAodGhpcy5wbGF5ZXJzQnlRdWVyaWVkRWxlbWVudCwgcGxheWVyLmVsZW1lbnQsIFtdKS5wdXNoKHBsYXllcik7XG4gICAgICBwbGF5ZXIub25Eb25lKCgpID0+IGRlbGV0ZU9yVW5zZXRJbk1hcCh0aGlzLnBsYXllcnNCeVF1ZXJpZWRFbGVtZW50LCBwbGF5ZXIuZWxlbWVudCwgcGxheWVyKSk7XG4gICAgfSk7XG5cbiAgICBhbGxDb25zdW1lZEVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBhZGRDbGFzcyhlbGVtZW50LCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FKSk7XG4gICAgY29uc3QgcGxheWVyID0gb3B0aW1pemVHcm91cFBsYXllcihhbGxOZXdQbGF5ZXJzKTtcbiAgICBwbGF5ZXIub25EZXN0cm95KCgpID0+IHtcbiAgICAgIGFsbENvbnN1bWVkRWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHJlbW92ZUNsYXNzKGVsZW1lbnQsIE5HX0FOSU1BVElOR19DTEFTU05BTUUpKTtcbiAgICAgIHNldFN0eWxlcyhyb290RWxlbWVudCwgaW5zdHJ1Y3Rpb24udG9TdHlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gdGhpcyBiYXNpY2FsbHkgbWFrZXMgYWxsIG9mIHRoZSBjYWxsYmFja3MgZm9yIHN1YiBlbGVtZW50IGFuaW1hdGlvbnNcbiAgICAvLyBiZSBkZXBlbmRlbnQgb24gdGhlIHVwcGVyIHBsYXllcnMgZm9yIHdoZW4gdGhleSBmaW5pc2hcbiAgICBhbGxTdWJFbGVtZW50cy5mb3JFYWNoKFxuICAgICAgICBlbGVtZW50ID0+IHsgZ2V0T3JTZXRBc0luTWFwKHNraXBwZWRQbGF5ZXJzTWFwLCBlbGVtZW50LCBbXSkucHVzaChwbGF5ZXIpOyB9KTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFBsYXllcihcbiAgICAgIGluc3RydWN0aW9uOiBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uLCBrZXlmcmFtZXM6IMm1U3R5bGVEYXRhW10sXG4gICAgICBwcmV2aW91c1BsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKTogQW5pbWF0aW9uUGxheWVyIHtcbiAgICBpZiAoa2V5ZnJhbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRyaXZlci5hbmltYXRlKFxuICAgICAgICAgIGluc3RydWN0aW9uLmVsZW1lbnQsIGtleWZyYW1lcywgaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5LFxuICAgICAgICAgIGluc3RydWN0aW9uLmVhc2luZywgcHJldmlvdXNQbGF5ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHdoZW4gYW4gZW1wdHkgdHJhbnNpdGlvbnxkZWZpbml0aW9uIGlzIHByb3ZpZGVkXG4gICAgLy8gLi4uIHRoZXJlIGlzIG5vIHBvaW50IGluIHJlbmRlcmluZyBhbiBlbXB0eSBhbmltYXRpb25cbiAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoaW5zdHJ1Y3Rpb24uZHVyYXRpb24sIGluc3RydWN0aW9uLmRlbGF5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGlvbkFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHByaXZhdGUgX3BsYXllcjogQW5pbWF0aW9uUGxheWVyID0gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgcHJpdmF0ZSBfY29udGFpbnNSZWFsUGxheWVyID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfcXVldWVkQ2FsbGJhY2tzOiB7W25hbWU6IHN0cmluZ106ICgoKSA9PiBhbnkpW119ID0ge307XG4gIHB1YmxpYyByZWFkb25seSBkZXN0cm95ZWQgPSBmYWxzZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXIgITogQW5pbWF0aW9uUGxheWVyO1xuXG4gIHB1YmxpYyBtYXJrZWRGb3JEZXN0cm95OiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIHJlYWRvbmx5IHF1ZXVlZDogYm9vbGVhbiA9IHRydWU7XG4gIHB1YmxpYyByZWFkb25seSB0b3RhbFRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWVzcGFjZUlkOiBzdHJpbmcsIHB1YmxpYyB0cmlnZ2VyTmFtZTogc3RyaW5nLCBwdWJsaWMgZWxlbWVudDogYW55KSB7fVxuXG4gIHNldFJlYWxQbGF5ZXIocGxheWVyOiBBbmltYXRpb25QbGF5ZXIpIHtcbiAgICBpZiAodGhpcy5fY29udGFpbnNSZWFsUGxheWVyKSByZXR1cm47XG5cbiAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgT2JqZWN0LmtleXModGhpcy5fcXVldWVkQ2FsbGJhY2tzKS5mb3JFYWNoKHBoYXNlID0+IHtcbiAgICAgIHRoaXMuX3F1ZXVlZENhbGxiYWNrc1twaGFzZV0uZm9yRWFjaChcbiAgICAgICAgICBjYWxsYmFjayA9PiBsaXN0ZW5PblBsYXllcihwbGF5ZXIsIHBoYXNlLCB1bmRlZmluZWQsIGNhbGxiYWNrKSk7XG4gICAgfSk7XG4gICAgdGhpcy5fcXVldWVkQ2FsbGJhY2tzID0ge307XG4gICAgdGhpcy5fY29udGFpbnNSZWFsUGxheWVyID0gdHJ1ZTtcbiAgICB0aGlzLm92ZXJyaWRlVG90YWxUaW1lKHBsYXllci50b3RhbFRpbWUpO1xuICAgICh0aGlzIGFze3F1ZXVlZDogYm9vbGVhbn0pLnF1ZXVlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0UmVhbFBsYXllcigpIHsgcmV0dXJuIHRoaXMuX3BsYXllcjsgfVxuXG4gIG92ZXJyaWRlVG90YWxUaW1lKHRvdGFsVGltZTogbnVtYmVyKSB7ICh0aGlzIGFzIGFueSkudG90YWxUaW1lID0gdG90YWxUaW1lOyB9XG5cbiAgc3luY1BsYXllckV2ZW50cyhwbGF5ZXI6IEFuaW1hdGlvblBsYXllcikge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gcC50cmlnZ2VyQ2FsbGJhY2sgISgnc3RhcnQnKSk7XG4gICAgfVxuICAgIHBsYXllci5vbkRvbmUoKCkgPT4gdGhpcy5maW5pc2goKSk7XG4gICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiB0aGlzLmRlc3Ryb3koKSk7XG4gIH1cblxuICBwcml2YXRlIF9xdWV1ZUV2ZW50KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnkpOiB2b2lkIHtcbiAgICBnZXRPclNldEFzSW5NYXAodGhpcy5fcXVldWVkQ2FsbGJhY2tzLCBuYW1lLCBbXSkucHVzaChjYWxsYmFjayk7XG4gIH1cblxuICBvbkRvbmUoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3F1ZXVlRXZlbnQoJ2RvbmUnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vbkRvbmUoZm4pO1xuICB9XG5cbiAgb25TdGFydChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnc3RhcnQnLCBmbik7XG4gICAgfVxuICAgIHRoaXMuX3BsYXllci5vblN0YXJ0KGZuKTtcbiAgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnF1ZXVlZCkge1xuICAgICAgdGhpcy5fcXVldWVFdmVudCgnZGVzdHJveScsIGZuKTtcbiAgICB9XG4gICAgdGhpcy5fcGxheWVyLm9uRGVzdHJveShmbik7XG4gIH1cblxuICBpbml0KCk6IHZvaWQgeyB0aGlzLl9wbGF5ZXIuaW5pdCgpOyB9XG5cbiAgaGFzU3RhcnRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucXVldWVkID8gZmFsc2UgOiB0aGlzLl9wbGF5ZXIuaGFzU3RhcnRlZCgpOyB9XG5cbiAgcGxheSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wbGF5KCk7IH1cblxuICBwYXVzZSgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5wYXVzZSgpOyB9XG5cbiAgcmVzdGFydCgpOiB2b2lkIHsgIXRoaXMucXVldWVkICYmIHRoaXMuX3BsYXllci5yZXN0YXJ0KCk7IH1cblxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX3BsYXllci5maW5pc2goKTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgKHRoaXMgYXN7ZGVzdHJveWVkOiBib29sZWFufSkuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9wbGF5ZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7ICF0aGlzLnF1ZXVlZCAmJiB0aGlzLl9wbGF5ZXIucmVzZXQoKTsgfVxuXG4gIHNldFBvc2l0aW9uKHA6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5xdWV1ZWQpIHtcbiAgICAgIHRoaXMuX3BsYXllci5zZXRQb3NpdGlvbihwKTtcbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5xdWV1ZWQgPyAwIDogdGhpcy5fcGxheWVyLmdldFBvc2l0aW9uKCk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIHRyaWdnZXJDYWxsYmFjayhwaGFzZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wbGF5ZXIgYXMgYW55O1xuICAgIGlmIChwLnRyaWdnZXJDYWxsYmFjaykge1xuICAgICAgcC50cmlnZ2VyQ2FsbGJhY2socGhhc2VOYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlT3JVbnNldEluTWFwKG1hcDogTWFwPGFueSwgYW55W10+fCB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBhbnksIHZhbHVlOiBhbnkpIHtcbiAgbGV0IGN1cnJlbnRWYWx1ZXM6IGFueVtdfG51bGx8dW5kZWZpbmVkO1xuICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgY3VycmVudFZhbHVlcyA9IG1hcC5nZXQoa2V5KTtcbiAgICBpZiAoY3VycmVudFZhbHVlcykge1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKTtcbiAgICAgICAgY3VycmVudFZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgbWFwLmRlbGV0ZShrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjdXJyZW50VmFsdWVzID0gbWFwW2tleV07XG4gICAgaWYgKGN1cnJlbnRWYWx1ZXMpIHtcbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgIGN1cnJlbnRWYWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50VmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGRlbGV0ZSBtYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnRWYWx1ZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRyaWdnZXJWYWx1ZSh2YWx1ZTogYW55KTogYW55IHtcbiAgLy8gd2UgdXNlIGAhPSBudWxsYCBoZXJlIGJlY2F1c2UgaXQncyB0aGUgbW9zdCBzaW1wbGVcbiAgLy8gd2F5IHRvIHRlc3QgYWdhaW5zdCBhIFwiZmFsc3lcIiB2YWx1ZSB3aXRob3V0IG1peGluZ1xuICAvLyBpbiBlbXB0eSBzdHJpbmdzIG9yIGEgemVybyB2YWx1ZS4gRE8gTk9UIE9QVElNSVpFLlxuICByZXR1cm4gdmFsdWUgIT0gbnVsbCA/IHZhbHVlIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50Tm9kZShub2RlOiBhbnkpIHtcbiAgcmV0dXJuIG5vZGUgJiYgbm9kZVsnbm9kZVR5cGUnXSA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNUcmlnZ2VyRXZlbnRWYWxpZChldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gZXZlbnROYW1lID09ICdzdGFydCcgfHwgZXZlbnROYW1lID09ICdkb25lJztcbn1cblxuZnVuY3Rpb24gY2xvYWtFbGVtZW50KGVsZW1lbnQ6IGFueSwgdmFsdWU/OiBzdHJpbmcpIHtcbiAgY29uc3Qgb2xkVmFsdWUgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXk7XG4gIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6ICdub25lJztcbiAgcmV0dXJuIG9sZFZhbHVlO1xufVxuXG5mdW5jdGlvbiBjbG9ha0FuZENvbXB1dGVTdHlsZXMoXG4gICAgdmFsdWVzTWFwOiBNYXA8YW55LCDJtVN0eWxlRGF0YT4sIGRyaXZlcjogQW5pbWF0aW9uRHJpdmVyLCBlbGVtZW50czogU2V0PGFueT4sXG4gICAgZWxlbWVudFByb3BzTWFwOiBNYXA8YW55LCBTZXQ8c3RyaW5nPj4sIGRlZmF1bHRTdHlsZTogc3RyaW5nKTogYW55W10ge1xuICBjb25zdCBjbG9ha1ZhbHM6IHN0cmluZ1tdID0gW107XG4gIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiBjbG9ha1ZhbHMucHVzaChjbG9ha0VsZW1lbnQoZWxlbWVudCkpKTtcblxuICBjb25zdCBmYWlsZWRFbGVtZW50czogYW55W10gPSBbXTtcblxuICBlbGVtZW50UHJvcHNNYXAuZm9yRWFjaCgocHJvcHM6IFNldDxzdHJpbmc+LCBlbGVtZW50OiBhbnkpID0+IHtcbiAgICBjb25zdCBzdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gICAgcHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGVzW3Byb3BdID0gZHJpdmVyLmNvbXB1dGVTdHlsZShlbGVtZW50LCBwcm9wLCBkZWZhdWx0U3R5bGUpO1xuXG4gICAgICAvLyB0aGVyZSBpcyBubyBlYXN5IHdheSB0byBkZXRlY3QgdGhpcyBiZWNhdXNlIGEgc3ViIGVsZW1lbnQgY291bGQgYmUgcmVtb3ZlZFxuICAgICAgLy8gYnkgYSBwYXJlbnQgYW5pbWF0aW9uIGVsZW1lbnQgYmVpbmcgZGV0YWNoZWQuXG4gICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGVsZW1lbnRbUkVNT1ZBTF9GTEFHXSA9IE5VTExfUkVNT1ZFRF9RVUVSSUVEX1NUQVRFO1xuICAgICAgICBmYWlsZWRFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHZhbHVlc01hcC5zZXQoZWxlbWVudCwgc3R5bGVzKTtcbiAgfSk7XG5cbiAgLy8gd2UgdXNlIGEgaW5kZXggdmFyaWFibGUgaGVyZSBzaW5jZSBTZXQuZm9yRWFjaChhLCBpKSBkb2VzIG5vdCByZXR1cm5cbiAgLy8gYW4gaW5kZXggdmFsdWUgZm9yIHRoZSBjbG9zdXJlIChidXQgaW5zdGVhZCBqdXN0IHRoZSB2YWx1ZSlcbiAgbGV0IGkgPSAwO1xuICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY2xvYWtFbGVtZW50KGVsZW1lbnQsIGNsb2FrVmFsc1tpKytdKSk7XG5cbiAgcmV0dXJuIGZhaWxlZEVsZW1lbnRzO1xufVxuXG4vKlxuU2luY2UgdGhlIEFuZ3VsYXIgcmVuZGVyZXIgY29kZSB3aWxsIHJldHVybiBhIGNvbGxlY3Rpb24gb2YgaW5zZXJ0ZWRcbm5vZGVzIGluIGFsbCBhcmVhcyBvZiBhIERPTSB0cmVlLCBpdCdzIHVwIHRvIHRoaXMgYWxnb3JpdGhtIHRvIGZpZ3VyZVxub3V0IHdoaWNoIG5vZGVzIGFyZSByb290cyBmb3IgZWFjaCBhbmltYXRpb24gQHRyaWdnZXIuXG5cbkJ5IHBsYWNpbmcgZWFjaCBpbnNlcnRlZCBub2RlIGludG8gYSBTZXQgYW5kIHRyYXZlcnNpbmcgdXB3YXJkcywgaXRcbmlzIHBvc3NpYmxlIHRvIGZpbmQgdGhlIEB0cmlnZ2VyIGVsZW1lbnRzIGFuZCB3ZWxsIGFueSBkaXJlY3QgKnN0YXJcbmluc2VydGlvbiBub2RlcywgaWYgYSBAdHJpZ2dlciByb290IGlzIGZvdW5kIHRoZW4gdGhlIGVudGVyIGVsZW1lbnRcbmlzIHBsYWNlZCBpbnRvIHRoZSBNYXBbQHRyaWdnZXJdIHNwb3QuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkUm9vdE1hcChyb290czogYW55W10sIG5vZGVzOiBhbnlbXSk6IE1hcDxhbnksIGFueVtdPiB7XG4gIGNvbnN0IHJvb3RNYXAgPSBuZXcgTWFwPGFueSwgYW55W10+KCk7XG4gIHJvb3RzLmZvckVhY2gocm9vdCA9PiByb290TWFwLnNldChyb290LCBbXSkpO1xuXG4gIGlmIChub2Rlcy5sZW5ndGggPT0gMCkgcmV0dXJuIHJvb3RNYXA7XG5cbiAgY29uc3QgTlVMTF9OT0RFID0gMTtcbiAgY29uc3Qgbm9kZVNldCA9IG5ldyBTZXQobm9kZXMpO1xuICBjb25zdCBsb2NhbFJvb3RNYXAgPSBuZXcgTWFwPGFueSwgYW55PigpO1xuXG4gIGZ1bmN0aW9uIGdldFJvb3Qobm9kZTogYW55KTogYW55IHtcbiAgICBpZiAoIW5vZGUpIHJldHVybiBOVUxMX05PREU7XG5cbiAgICBsZXQgcm9vdCA9IGxvY2FsUm9vdE1hcC5nZXQobm9kZSk7XG4gICAgaWYgKHJvb3QpIHJldHVybiByb290O1xuXG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIGlmIChyb290TWFwLmhhcyhwYXJlbnQpKSB7ICAvLyBuZ0lmIGluc2lkZSBAdHJpZ2dlclxuICAgICAgcm9vdCA9IHBhcmVudDtcbiAgICB9IGVsc2UgaWYgKG5vZGVTZXQuaGFzKHBhcmVudCkpIHsgIC8vIG5nSWYgaW5zaWRlIG5nSWZcbiAgICAgIHJvb3QgPSBOVUxMX05PREU7XG4gICAgfSBlbHNlIHsgIC8vIHJlY3Vyc2UgdXB3YXJkc1xuICAgICAgcm9vdCA9IGdldFJvb3QocGFyZW50KTtcbiAgICB9XG5cbiAgICBsb2NhbFJvb3RNYXAuc2V0KG5vZGUsIHJvb3QpO1xuICAgIHJldHVybiByb290O1xuICB9XG5cbiAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICBjb25zdCByb290ID0gZ2V0Um9vdChub2RlKTtcbiAgICBpZiAocm9vdCAhPT0gTlVMTF9OT0RFKSB7XG4gICAgICByb290TWFwLmdldChyb290KSAhLnB1c2gobm9kZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcm9vdE1hcDtcbn1cblxuY29uc3QgQ0xBU1NFU19DQUNIRV9LRVkgPSAnJCRjbGFzc2VzJztcbmZ1bmN0aW9uIGNvbnRhaW5zQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBjbGFzc2VzID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgcmV0dXJuIGNsYXNzZXMgJiYgY2xhc3Nlc1tjbGFzc05hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGNsYXNzZXM6IHtbY2xhc3NOYW1lOiBzdHJpbmddOiBib29sZWFufSA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldO1xuICAgIGlmICghY2xhc3Nlcykge1xuICAgICAgY2xhc3NlcyA9IGVsZW1lbnRbQ0xBU1NFU19DQUNIRV9LRVldID0ge307XG4gICAgfVxuICAgIGNsYXNzZXNbY2xhc3NOYW1lXSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZykge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgY2xhc3Nlczoge1tjbGFzc05hbWU6IHN0cmluZ106IGJvb2xlYW59ID0gZWxlbWVudFtDTEFTU0VTX0NBQ0hFX0tFWV07XG4gICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgIGRlbGV0ZSBjbGFzc2VzW2NsYXNzTmFtZV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGVzQWZ0ZXJBbmltYXRpb25Eb25lKFxuICAgIGVuZ2luZTogVHJhbnNpdGlvbkFuaW1hdGlvbkVuZ2luZSwgZWxlbWVudDogYW55LCBwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSkge1xuICBvcHRpbWl6ZUdyb3VwUGxheWVyKHBsYXllcnMpLm9uRG9uZSgoKSA9PiBlbmdpbmUucHJvY2Vzc0xlYXZlTm9kZShlbGVtZW50KSk7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5Hcm91cFBsYXllcnMocGxheWVyczogQW5pbWF0aW9uUGxheWVyW10pOiBBbmltYXRpb25QbGF5ZXJbXSB7XG4gIGNvbnN0IGZpbmFsUGxheWVyczogQW5pbWF0aW9uUGxheWVyW10gPSBbXTtcbiAgX2ZsYXR0ZW5Hcm91cFBsYXllcnNSZWN1cihwbGF5ZXJzLCBmaW5hbFBsYXllcnMpO1xuICByZXR1cm4gZmluYWxQbGF5ZXJzO1xufVxuXG5mdW5jdGlvbiBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdLCBmaW5hbFBsYXllcnM6IEFuaW1hdGlvblBsYXllcltdKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBsYXllciA9IHBsYXllcnNbaV07XG4gICAgaWYgKHBsYXllciBpbnN0YW5jZW9mIEFuaW1hdGlvbkdyb3VwUGxheWVyKSB7XG4gICAgICBfZmxhdHRlbkdyb3VwUGxheWVyc1JlY3VyKHBsYXllci5wbGF5ZXJzLCBmaW5hbFBsYXllcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaW5hbFBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBvYmpFcXVhbHMoYToge1trZXk6IHN0cmluZ106IGFueX0sIGI6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gIGNvbnN0IGsxID0gT2JqZWN0LmtleXMoYSk7XG4gIGNvbnN0IGsyID0gT2JqZWN0LmtleXMoYik7XG4gIGlmIChrMS5sZW5ndGggIT0gazIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgazEubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwcm9wID0gazFbaV07XG4gICAgaWYgKCFiLmhhc093blByb3BlcnR5KHByb3ApIHx8IGFbcHJvcF0gIT09IGJbcHJvcF0pIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVBvc3RTdHlsZXNBc1ByZShcbiAgICBlbGVtZW50OiBhbnksIGFsbFByZVN0eWxlRWxlbWVudHM6IE1hcDxhbnksIFNldDxzdHJpbmc+PixcbiAgICBhbGxQb3N0U3R5bGVFbGVtZW50czogTWFwPGFueSwgU2V0PHN0cmluZz4+KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBvc3RFbnRyeSA9IGFsbFBvc3RTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgaWYgKCFwb3N0RW50cnkpIHJldHVybiBmYWxzZTtcblxuICBsZXQgcHJlRW50cnkgPSBhbGxQcmVTdHlsZUVsZW1lbnRzLmdldChlbGVtZW50KTtcbiAgaWYgKHByZUVudHJ5KSB7XG4gICAgcG9zdEVudHJ5LmZvckVhY2goZGF0YSA9PiBwcmVFbnRyeSAhLmFkZChkYXRhKSk7XG4gIH0gZWxzZSB7XG4gICAgYWxsUHJlU3R5bGVFbGVtZW50cy5zZXQoZWxlbWVudCwgcG9zdEVudHJ5KTtcbiAgfVxuXG4gIGFsbFBvc3RTdHlsZUVsZW1lbnRzLmRlbGV0ZShlbGVtZW50KTtcbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=