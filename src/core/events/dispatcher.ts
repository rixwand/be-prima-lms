import { EventEmitter } from "events";
import { DomainEventName, DomainEventPayloadMap } from "./events";

class DomainEventDispatcher extends EventEmitter {
  emit<TEventName extends DomainEventName>(eventName: TEventName, payload: DomainEventPayloadMap[TEventName]) {
    return super.emit(eventName, payload);
  }

  on<TEventName extends DomainEventName>(
    eventName: TEventName,
    listener: (payload: DomainEventPayloadMap[TEventName]) => void,
  ) {
    return super.on(eventName, listener);
  }
}

const dispatcher = new DomainEventDispatcher();

export default dispatcher;
