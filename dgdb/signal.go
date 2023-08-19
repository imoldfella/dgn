package dgdb

// a Subscription can be a statement that we execute to subscribe to a channel

type SignalContext struct {
}

func (a *SignalContext) CreateEffect(fn func() error) {
	fn()
}

type Signal interface {
	addListener(f func()) func()
	removeListener(f func()) error
}
